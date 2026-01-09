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
    timer: number,
    preview_url: string
}

type Event = ScoreEvent | QuestionStartsEvent;

export default function RoomCard({ settingsRef, startRound, enterRoom }: { settingsRef: React.RefObject<Settings>, startRound: (timer: number, preview_url: string) => void, enterRoom: () => void }) {
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
        const socket = new WebSocket(`${protocol}://${window.location.host}/ws/room/${roomName}/`);

        socket.onmessage = (event) => {
            const data: Event = JSON.parse(event.data);

            if (data.type === "question_starts") {
                if (startRound) {
                    startRound(Number(data.timer), data.preview_url);
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
    }, [roomName])

    return (
        <div className="h-40 w-80 md:h-60 md:w-110 border-5 border-lighterblue rounded-xl flex flex-col justify-center items-center p-2 md:p-5 gap-5 text-darkblue font-bold relative">
            {
                settingsRef.current.roomName ?
                    <div className="flex flex-col h-full w-full items-center">
                        <span className="text-lg md:text-xl text-lighterblue">Room Name: {settingsRef.current.roomName}</span>
                        <Table className="flex-1 w-full">
                            <TableBody className="bg-muted/50 text-xs md:text-base">
                                {
                                    Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([name, score]) => {
                                        return (
                                            <TableRow key={name} className={correctGuesses.includes(name) ? "bg-green-300" : (partialGuesses.includes(name) ? "bg-yellow-300" : "")}>
                                                <TableCell className="p-1 md:p-2">{name}</TableCell>
                                                <TableCell className="p-1 md:p-2">{score}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                    </div>
                    :
                    <Button onClick={createRoom} className="bg-purple-800 hover:bg-purple-900 hover:cursor-pointer">Create Room</Button>
            }
        </div >
    )
}