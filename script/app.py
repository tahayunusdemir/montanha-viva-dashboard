from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
DATABASE = "iot_data.db"


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS iot_stations (
            station_id TEXT PRIMARY KEY,
            location TEXT
        )
    """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS measurements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id TEXT,
            measurement_type TEXT,
            value REAL,
            recorded_at INTEGER,
            FOREIGN KEY (station_id) REFERENCES iot_stations (station_id)
        )
    """
    )
    conn.commit()
    conn.close()


@app.route("/api/stations", methods=["GET"])
def get_stations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT station_id, location, name, is_active FROM iot_stations ORDER BY station_id"
    )
    stations = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in stations])


@app.route("/api/data", methods=["GET"])
def get_data():
    station_id = request.args.get("station_id", None)

    conn = get_db_connection()
    cursor = conn.cursor()

    if station_id:
        cursor.execute(
            "SELECT * FROM measurements WHERE station_id = ? ORDER BY recorded_at DESC",
            (station_id,),
        )
    else:
        cursor.execute("SELECT * FROM measurements ORDER BY recorded_at DESC")

    rows = cursor.fetchall()
    conn.close()

    # Converter para lista de dicionários
    resultados = [dict(row) for row in rows]
    return jsonify(resultados)


@app.route("/api/iot-data", methods=["POST"])
def receive_iot_data():
    data = request.json

    print(f"Received IoT data: {data}")

    station_id = data.get("station_id")
    location = data.get("location", None)
    measurements = data.get("measurements", [])

    if not station_id or not measurements:
        return jsonify({"error": "station_id and measurements are required"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Insere a estação se não existir
        cursor.execute("SELECT 1 FROM iot_stations WHERE station_id = ?", (station_id,))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO iot_stations (station_id, location) VALUES (?, ?)",
                (station_id, location),
            )

        # Insere as medições
        for m in measurements:
            m_type = m.get("type")
            value = m.get("value")
            recorded_at = m.get("recorded_at")  # Unix timestamp
            if not (m_type and value is not None and recorded_at is not None):
                continue
            cursor.execute(
                "INSERT INTO measurements (station_id, measurement_type, value, recorded_at) VALUES (?, ?, ?, ?)",
                (station_id, m_type, value, recorded_at),
            )

        conn.commit()
        return jsonify({"status": "success"}), 200

    except Exception as e:
        conn.rollback()
        print(f"Error inserting IoT data: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
