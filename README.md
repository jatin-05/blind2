setting up frontend

    cd to frontend folder
    npm install
    change the code in objectdetection2 line 46 47
        const ws = new WebSocket(`wss://${apiUrl}/ws`);
        // const ws = new WebSocket("ws://localhost:8000/ws");
    to
        //const ws = new WebSocket(`wss://${apiUrl}/ws`);
        const ws = new WebSocket("ws://localhost:8000/ws");

    npm run dev
    now open the localhost link in browser allow the camera

setting up fastapi

    cd to backend folder
    in cli run
    pip install -r requirements.txt

    open main.py
    change code in the last line

            uvicorn.run(app , host = '0.0.0.0')
            # uvicorn.run(app , host = 'localhost' , port =8000)
        to

            #uvicorn.run(app , host = '0.0.0.0')
            uvicorn.run(app , host = 'localhost' , port =8000)

    run main.py (in vs code ctrl+shift+p    ->   search python: select interpreter -> select the suitable option then run main.py )
