import React, {useState, useEffect} from 'react'
import {fromEvent, interval, Subject} from "rxjs";
// import appstyle from './App.module.css'
import {
    filter,
    repeatWhen,
    share,
    takeUntil,
} from "rxjs/operators";
import {tryCatch} from "rxjs/internal-compatibility";

const action$ = new Subject();
const stop$ = action$.pipe(filter(action => action === 'stop'), share());
const reset$ = action$.pipe(filter(action => action === 'reset'), share());

const time$ = interval(1000).pipe(
    repeatWhen(()=> reset$),
    share(),
    takeUntil(stop$),
);
const click_event = (element, click1) => {
    let timer;
    const click = fromEvent(element, 'click').subscribe(clickety => {
            if(timer){
                click1();
                clearTimeout(timer);
                timer = 0;
                return () => click.unsubscribe();
            }
            timer = setTimeout(() => {
                timer = 0;
            }, 300)
        }
    );
};

const App = () => {
    let [time, setTime] = useState(0);
    let [timerOn, setTimerOn] = useState(false)
    const buttonEl = React.useRef(null);

    useEffect(() => {
        let subscription = undefined;
        if(timerOn){
            subscription = time$.subscribe(() => setTime(prevTime => prevTime + 1));
        }else{
            tryCatch(() => {
                subscription.unsubscribe()
            })
        }
        tryCatch(() => {
            return () => subscription.unsubscribe()

        })

    }, [timerOn]);
    useEffect(() => {
        click_event(buttonEl.current,() => {
            setTimerOn(false);
            action$.next("stop")
        })

    }, []);
    return(
        <div>
            
            <h1>
                <span>{('0' + Math.floor((time / 3600) % 60)).slice(-2)}</span>:
                <span>{('0' + Math.floor((time / 60) % 60)).slice(-2)}</span>:
                <span>{('0' + (time % 60)).slice(-2)}</span>
            </h1>

            <button onClick={()=> setTimerOn(true)}>START</button>

            <button onClick={()=> {
                setTimerOn(false) ;
                setTime(0);
                action$.next("stop")
            }}>STOP</button>

            <button onClick={()=> {
                action$.next("reset");
                setTime(0)
            }}>RESET</button>
            <button ref={buttonEl}>WAIT</button>

        </div>
    )
};

export default App;
