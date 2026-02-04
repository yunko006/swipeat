// ABOUTME: Video player component for timing editor
// ABOUTME: Displays video with play/pause overlay

"use client";

import { forwardRef } from "react";
import { Play, Pause } from "lucide-react";

interface EditVideoPlayerProps {
	videoUrl?: string;
	isPlaying: boolean;
	onTogglePlayPause: () => void;
	onTimeUpdate: () => void;
	onLoadedMetadata: () => void;
	onPlay: () => void;
	onPause: () => void;
}

export const EditVideoPlayer = forwardRef<HTMLVideoElement, EditVideoPlayerProps>(
	function EditVideoPlayer(
		{
			videoUrl,
			isPlaying,
			onTogglePlayPause,
			onTimeUpdate,
			onLoadedMetadata,
			onPlay,
			onPause,
		},
		ref,
	) {
		return (
			<div className="relative bg-black rounded-xl overflow-hidden">
				<video
					ref={ref}
					src={videoUrl}
					className="w-full aspect-[9/16] max-h-[60vh] lg:max-h-[52vh] object-contain"
					onTimeUpdate={onTimeUpdate}
					onLoadedMetadata={onLoadedMetadata}
					onPlay={onPlay}
					onPause={onPause}
				/>

				<button
					onClick={onTogglePlayPause}
					className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
				>
					<div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
						{isPlaying ? (
							<Pause className="w-8 h-8 text-white" />
						) : (
							<Play className="w-8 h-8 text-white ml-1" />
						)}
					</div>
				</button>
			</div>
		);
	},
);
