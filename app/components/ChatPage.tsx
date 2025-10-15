import React from "react";
import { Session } from "next-auth";

export default function ChatPage({session}: {session: Session}){

    return(
        <div>{session.user?.name}</div>
    )
}