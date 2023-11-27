import asyncio
import json
import websockets
import cv2
async def send_video_data(websocket):
    cap = cv2.VideoCapture(0)
    face = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

    while True:
        _, img = cap.read()
        gy = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        fc = face.detectMultiScale(gy, 1.1, 4)

        x1, y1, w1, h1 = 0, 0, 0, 0

        for (x, y, w, h) in fc:
            x1, y1, w1, h1 = x, y, w, h

        data = {"x": str(x1), "y": str(y1), "w": str(w1), "h": str(h1)}
        js = json.dumps(data)
        print(js)
        await websocket.send(js)
        await asyncio.sleep(0.1)

async def handler(websocket, path):
    producer_task = asyncio.create_task(send_video_data(websocket))
    await producer_task
 
start_server = websockets.serve(handler, "localhost", 8000)
 
asyncio.get_event_loop().run_until_complete(start_server)
 
asyncio.get_event_loop().run_forever()
