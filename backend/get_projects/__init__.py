import json
import logging
import os

import azure.functions as func
from azure.data.tables import TableServiceClient

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
}

TABLE_NAME = "projects"
CONNECTION_STRING_ENV = "AZURE_STORAGE_CONNECTION_STRING"


def get_table_client():
    connection_string = os.getenv(CONNECTION_STRING_ENV)
    if not connection_string:
        raise ValueError(
            f"Missing required environment variable: {CONNECTION_STRING_ENV}"
        )

    service_client = TableServiceClient.from_connection_string(connection_string)
    return service_client.get_table_client(table_name=TABLE_NAME)


def json_response(status_code, body):
    return func.HttpResponse(
        json.dumps(body),
        status_code=status_code,
        mimetype="application/json",
        headers=CORS_HEADERS,
    )


def main(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=CORS_HEADERS)

    try:
        table_client = get_table_client()
        projects = []

        for entity in table_client.list_entities():
            projects.append(
                {
                    "id": entity.get("RowKey", ""),
                    "name": entity.get("name", ""),
                    "description": entity.get("description", ""),
                    "route": entity.get("route", ""),
                    "videoUrl": entity.get("videoUrl", ""),
                }
            )

        return json_response(200, projects)
    except Exception:
        logging.exception("Failed to fetch projects from Azure Table Storage")
        return json_response(
            500,
            {"error": "Internal server error while fetching projects."},
        )
