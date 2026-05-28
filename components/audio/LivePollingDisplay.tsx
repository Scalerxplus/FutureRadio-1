"use client";

import React, { useEffect, useState } from "react";
import { useAudioStore } from "./useAudioStore";

interface PollOption {
  song_title: string;
  song_artist: string;
  song_track_id: string;
  votes: number;
}

interface Poll {
  id: string;
  city_id: string;
  poll_date: string;
  song1_title: string;
  song1_artist: string;
  song1_track_id: string;
  song1_votes: number;
  song2_title: string;
  song2_artist: string;
  song2_track_id: string;
  song2_votes: number;
  song3_title: string;
  song3_artist: string;
  song3_track_id: string;
  song3_votes: number;
}

export default function LivePollingDisplay({ cityId }: { cityId: string }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const { listenerId } = useAudioStore();

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await fetch(`/api/polls/today?cityId=${cityId}`);
        const data = await res.json();
        if (data.poll) {
          setPoll(data.poll);
          // Check local storage to see if they voted already for THIS poll
          const votedKey = `voted_${data.poll.id}`;
          if (localStorage.getItem(votedKey)) {
             setHasVoted(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch poll", err);
      }
    };
    fetchPoll();
  }, [cityId]);

  const handleVote = async (optionNum: number) => {
    if (!poll || hasVoted || isVoting) return;
    setIsVoting(true);

    try {
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId: poll.id,
          listenerId: listenerId || "anonymous-" + Math.random().toString(36).substring(7),
          votedFor: optionNum
        })
      });

      const data = await res.json();
      if (res.ok && data.poll) {
        setPoll(data.poll);
        setHasVoted(true);
        localStorage.setItem(`voted_${poll.id}`, "true");
      } else {
        alert(data.error || "Failed to vote");
        if (data.error === "You have already voted today!") {
           setHasVoted(true);
           localStorage.setItem(`voted_${poll.id}`, "true");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  if (!poll) {
    return (
      <div className="w-full bg-[#1c1c24] border border-[#2a2a35] rounded-xl p-4 animate-pulse">
         <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
         <div className="space-y-3">
           <div className="h-10 bg-gray-700 rounded-lg w-full"></div>
           <div className="h-10 bg-gray-700 rounded-lg w-full"></div>
           <div className="h-10 bg-gray-700 rounded-lg w-full"></div>
         </div>
      </div>
    );
  }

  const totalVotes = (poll.song1_votes || 0) + (poll.song2_votes || 0) + (poll.song3_votes || 0);

  const getPercent = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const renderOption = (num: number, title: string, artist: string, votes: number) => {
    const percent = getPercent(votes);
    
    return (
      <button 
        onClick={() => handleVote(num)}
        disabled={hasVoted || isVoting}
        className={`relative w-full overflow-hidden rounded-lg transition-all duration-300 ${hasVoted ? 'bg-[#2a2a35] border border-[#3a3a45] cursor-default' : 'bg-[#1c1c24] border border-brand-red/40 hover:border-brand-red hover:bg-[#252530]'}`}
      >
        {/* Progress Bar Background */}
        {hasVoted && (
           <div 
             className="absolute left-0 top-0 h-full bg-brand-red/20 transition-all duration-1000 ease-out"
             style={{ width: `${percent}%` }}
           />
        )}
        
        <div className="relative z-10 flex items-center justify-between p-3 text-left">
           <div>
             <div className="text-sm font-bold text-white line-clamp-1">{title}</div>
             <div className="text-[10px] text-gray-400">{artist}</div>
           </div>
           {hasVoted && (
             <div className="text-sm font-bold text-brand-red ml-2">{percent}%</div>
           )}
        </div>
      </button>
    );
  };

  return (
    <div className="w-full bg-[#111118]/80 backdrop-blur-md border border-[#2a2a35] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Tomorrow's Opening Track
        </h3>
        {hasVoted && <span className="text-[10px] text-white font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full">Voted</span>}
      </div>
      
      <p className="text-[10px] text-gray-400 mb-4 font-medium">
        {hasVoted 
          ? "Thanks for voting! The winning track will kick off tomorrow's playlist." 
          : "Vote for the track you want to hear first tomorrow!"}
      </p>

      <div className="space-y-2.5">
        {renderOption(1, poll.song1_title, poll.song1_artist, poll.song1_votes)}
        {renderOption(2, poll.song2_title, poll.song2_artist, poll.song2_votes)}
        {renderOption(3, poll.song3_title, poll.song3_artist, poll.song3_votes)}
      </div>
      
      {hasVoted && (
        <div className="mt-3 text-center text-[9px] text-gray-500 uppercase tracking-wider font-semibold">
          Total Votes: {totalVotes}
        </div>
      )}
    </div>
  );
}
