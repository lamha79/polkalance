import { useChatInstance, useCurrentUser } from "../../front-provider/src";
import { useCallback, useEffect, useState } from "react";
import { getChatConversations } from "../services/chat";
import { ChatInstance } from "../../utility/src";

export const useGetMyChats = () => {
    const {user} = useCurrentUser();
    const {chats, setChats, setFetching, fetching} = useChatInstance();
    const pollingInterval = 5000; // 5000 milliseconds = 5 seconds

    const getChats = useCallback(async () => {
        const res = await getChatConversations();
        setChats(res);
        setFetching(false);
      }, [setChats, setFetching])

    useEffect(() => {
        if (user && !fetching) {
            setFetching(true);
            getChats();
         
            const intervalId = setInterval(() => {
                getChats();
            }, pollingInterval);
            // Clear interval on component unmount or user change
            return () => clearInterval(intervalId);
        }
    }, [user, getChats])
};