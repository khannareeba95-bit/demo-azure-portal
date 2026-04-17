"""
Lambda handler for admin data endpoints.
Routes:
  GET /admin/documents  — list documents from DynamoDB
  GET /admin/logs       — list processing logs from DynamoDB
  GET /admin/pipelines  — list pipeline statuses from DynamoDB

Environment variables:
  DOCUMENTS_TABLE   DynamoDB table name for documents
  LOGS_TABLE        DynamoDB table name for logs
  PIPELINES_TABLE   DynamoDB table name for pipelines
"""

import json
import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Content-Type": "application/json",
}


def respond(status_code, body):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


def scan_table(table_name, limit=100):
    table = dynamodb.Table(table_name)
    result = table.scan(Limit=limit)
    return result.get("Items", [])


def handler(event, context):
    method = event.get("httpMethod", "GET")
    path = event.get("path", "")

    if method == "OPTIONS":
        return respond(200, {})

    if method != "GET":
        return respond(405, {"error": "Method not allowed"})

    if path.endswith("/documents"):
        table_name = os.environ.get("DOCUMENTS_TABLE", "intellidoc-documents")
        items = scan_table(table_name)
        return respond(200, {"documents": items})

    if path.endswith("/logs"):
        table_name = os.environ.get("LOGS_TABLE", "platform-logs")
        items = scan_table(table_name)
        return respond(200, {"logs": items})

    if path.endswith("/pipelines"):
        table_name = os.environ.get("PIPELINES_TABLE", "data-orchestration-pipelines")
        items = scan_table(table_name)
        return respond(200, {"pipelines": items})

    return respond(404, {"error": "Not found"})
