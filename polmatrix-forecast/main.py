# main.py
from fastapi import FastAPI, Request, HTTPException
from model_runner import predict_future
import traceback
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.post("/forecast")
async def forecast(request: Request):
    try:
        logger.info("Forecast endpoint called")
        body = await request.json()
        logger.info(f"Request body: {body}")
        
        result = predict_future(
            metric=body["metric"],
            region=body["region"],
            start_year=body["startYear"],
            end_year=body["endYear"],
            context=body.get("context", {})  # optional extra features
        )
        
        logger.info(f"Forecast successful, returning {len(result) if isinstance(result, list) else 'single'} result(s)")
        return result
        
    except Exception as e:
        logger.error(f"Forecast error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Forecast failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Polmatrix Forecast Service", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
