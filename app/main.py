import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import openai
import asyncio

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


async def generate_image(prompt: str):
    if not openai.api_key:
        raise HTTPException(status_code=500, detail="API key not configured")

    response = await openai.AsyncClient().images.generate(
        model="gpt-image-1",
        prompt=prompt,
        n=1,
        size="1024x1024",
        stream=True,
    )
    async for chunk in response:
        if "data" in chunk:
            for part in chunk["data"]:
                if url := part.get("url"):
                    yield url


@app.post("/generate")
async def generate(request: Request):
    data = await request.json()
    prompt = data.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    async def event_generator():
        async for url in generate_image(prompt):
            yield url + "\n"

    return StreamingResponse(event_generator(), media_type="text/plain")
