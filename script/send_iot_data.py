import pandas as pd
import requests
import os


def convert_and_send_iot_data(csv_path, api_url, default_location="Unknown Location"):
    df = pd.read_csv(csv_path)

    if "Timestamp" not in df.columns or "DeviceID" not in df.columns:
        raise ValueError(f"Arquivo {csv_path} não contém 'Timestamp' e 'DeviceID'")

    grouped = df.groupby("DeviceID")
    payloads = []

    for device_id, group in grouped:
        measurements = []
        for _, row in group.iterrows():
            timestamp = row["Timestamp"]
            for col in group.columns:
                if col in ["Timestamp", "DeviceID"]:
                    continue
                value = row[col]
                if pd.isna(value):
                    continue
                measurements.append(
                    {
                        "type": col.strip()
                        .lower()
                        .replace(" ", "_")
                        .replace("[", "")
                        .replace("]", ""),
                        "value": float(value),
                        "recorded_at": timestamp,
                    }
                )

        if not measurements:
            continue

        payload = {
            "station_id": device_id,
            "location": default_location,
            "measurements": measurements,
        }

        payloads.append(payload)

        try:
            response = requests.post(api_url, json=payload)
            print(
                f"[{csv_path}] Station {device_id} => Status {response.status_code}: {response.text}"
            )
        except Exception as e:
            print(
                f"Erro ao enviar dados do arquivo {csv_path} (estação {device_id}): {e}"
            )

    return payloads


if __name__ == "__main__":
    pasta_dos_csvs = "dados_csv"
    api_url = "http://localhost:5000/iot-data"

    for arquivo in os.listdir(pasta_dos_csvs):
        if arquivo.endswith(".csv"):
            caminho_completo = os.path.join(pasta_dos_csvs, arquivo)
            try:
                convert_and_send_iot_data(caminho_completo, api_url)
            except Exception as e:
                print(f"Erro ao processar {arquivo}: {e}")
