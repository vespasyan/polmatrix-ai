# main.py
from fastapi import FastAPI, Request
from model_runner import predict_future

app = FastAPI()

@app.post("/forecast")
async def forecast(request: Request):
    body = await request.json()
    return predict_future(
        metric=body["metric"],
        region=body["region"],
        start_year=body["startYear"],
        end_year=body["endYear"],
        context=body.get("context", {})  # optional extra features
    )
