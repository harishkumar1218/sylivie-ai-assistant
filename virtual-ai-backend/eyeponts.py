import cv2
import sys
import json
import requests
url = 'http://localhost:3001/receiveData'
payload = {'data': f'Received: HIII'}
response = requests.post(url, json=payload)
cap=cv2.VideoCapture(0)
face=cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
# while True:
_,img=cap.read()
gy=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
fc=face.detectMultiScale(gy,1.1,4)
x1=0
y1=0
w1=0
h1=0

for (x,y,w,h) in fc:
    x1=x
    y1=y
    w1=w
    h1=h
    dic={"x":x1,"y":y1,"w":w1,"h":h1}
js=json.dumps(dic)
print(js)
# cv2.imshow('img',img)
    # k=cv2.waitKey(30) & 0xff
    # if k==27:
    #     break
cap.relase()
for line in sys.stdin:
    # Process the input
    input_data = line.strip()

    # Perform operations with the input

    # Send data to Node.js using REST API
    url = 'http://localhost:3001/receiveData'
    payload = {'data': f'Received: {input_data}'}
    response = requests.post(url, json=payload)

    if response.status_code == 200:
        print('Data sent to Node.js successfully')
    else:
        print('Failed to send data to Node.js')

    sys.stdout.flush() 
