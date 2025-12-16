import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "./components/ui/table";
import type { Settings } from "./lib/types";
import { post } from "./utils/utils";

type ScoreEvent =
    {
        type: "player_joins" | "player_leaves" | "player_guessed",
        player_name: string | undefined | null,
        correct_guesses: string[],
        partial_guesses: string[],
        scores: Record<string, number>,
        timer: number | null | undefined,
    }

type QuestionStartsEvent = {
    type: "question_starts",
    timer: number
}

type Event = ScoreEvent | QuestionStartsEvent;

export default function RoomCard({ settingsRef, startRound, enterRoom }: { settingsRef: React.RefObject<Settings>, startRound: (timer: number) => void, enterRoom: () => void }) {
    const [roomName, setRoomName] = useState<string | null>(settingsRef.current.roomName);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [correctGuesses, setCorrectGuesses] = useState<string[]>([]);
    const [partialGuesses, setPartialGuesses] = useState<string[]>([]);

    const navigate = useNavigate();

    const createRoom = () => {
        post(`/api/quiz/room/`, navigate).then(res => {
            if (res.status === 200) {
                res.json().then(data => {
                    settingsRef.current.roomName = data.room_name;
                    setRoomName(data.room_name);
                    enterRoom();
                })
            }
        })
    }

    useEffect(() => {
        if (!roomName) {
            return;
        }
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const socket = new WebSocket(`${protocol}://${window.location.host}/ws/room/${roomName}/?device_id=${settingsRef.current.deviceId}`);

        socket.onmessage = (event) => {
            const data: Event = JSON.parse(event.data);

            if (data.type === "question_starts") {
                if (startRound) {
                    startRound(Number(data.timer));
                    setCorrectGuesses([]);
                    setPartialGuesses([]);
                }
            } else {
                setScores(data.scores);
                setCorrectGuesses(data.correct_guesses);
                setPartialGuesses(data.partial_guesses);
            }
        }

        return () => {
            socket.close();
        }
    }, [roomName, settingsRef.current.deviceId])

    return (
        <div className="h-60 w-110 border-5 border-cred rounded-xl flex flex-col justify-center items-center p-5 gap-5 text-darkblue font-bold relative">
            {
                settingsRef.current.roomName ?
                    <div className="flex flex-col h-full w-full items-center">
                        <span className="text-xl text-cred">Room Name: {settingsRef.current.roomName}</span>
                        <Table className="flex-1 w-full">
                            <TableBody className="bg-muted/50">
                                {
                                    Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([name, score]) => {
                                        return (
                                            <TableRow key={name} className={correctGuesses.includes(name) ? "bg-green-300" : (partialGuesses.includes(name) ? "bg-yellow-300" : "")}>
                                                <TableCell>{name}</TableCell>
                                                <TableCell>{score}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                    </div>
                    :
                    <Button onClick={createRoom} className="bg-corange text-white hover:bg-cred">Create Room</Button>
            }
        </div >
    )
}