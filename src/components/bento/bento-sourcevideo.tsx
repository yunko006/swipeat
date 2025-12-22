"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

interface BentoSourceVideoProps {
	onPlayClick: () => void;
	thumbnailUrl?: string;
	videoUrl?: string;
	sourceUrl?: string;
	sourcePlatform?: "tiktok" | "instagram" | "youtube";
}

export function BentoSourceVideo({
	onPlayClick,
	thumbnailUrl = "/cooking-pasta-kitchen-warm.jpg",
	videoUrl,
	sourceUrl,
	sourcePlatform,
}: BentoSourceVideoProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const handlePlayClick = () => {
		if (videoRef.current && videoUrl) {
			if (isPlaying) {
				videoRef.current.pause();
				setIsPlaying(false);
			} else {
				videoRef.current.play();
				setIsPlaying(true);
			}
		} else {
			onPlayClick();
		}
	};

	return (
		<div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-all h-full min-h-[500px]">
			{/* Marge rouge */}
			<div className="absolute left-6 top-0 bottom-0 w-px bg-rose-500/30 z-10" />

			<div className="relative p-6 h-full flex flex-col">
				<h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
					Video
				</h3>

				<div className="flex-1 flex items-center justify-center relative rounded-xl overflow-hidden">
					{videoUrl ? (
						<>
							<video
								ref={videoRef}
								className="w-full h-full object-cover rounded-xl"
								src={videoUrl}
								poster={thumbnailUrl}
								loop
								playsInline
							/>
							<button
								onClick={handlePlayClick}
								className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all cursor-pointer"
							>
								<div className="w-20 h-20 rounded-full border-2 border-white/80 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all backdrop-blur-sm">
									<Play className="w-8 h-8 text-white ml-1 fill-white" />
								</div>
							</button>
						</>
					) : (
						<>
							<div
								className="absolute inset-0 bg-cover bg-center opacity-30 rounded-xl"
								style={{ backgroundImage: `url('${thumbnailUrl}')` }}
							/>
							<div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent rounded-xl" />
							<button
								onClick={handlePlayClick}
								className="relative w-20 h-20 rounded-full border-2 border-foreground/30 flex items-center justify-center hover:border-foreground/60 hover:bg-foreground/10 transition-all backdrop-blur-sm cursor-pointer"
							>
								<Play className="w-8 h-8 text-foreground/50 hover:text-foreground/80 transition-all ml-1" />
							</button>
						</>
					)}
				</div>

				<p className="text-xs text-muted-foreground text-center mt-4">
					{videoUrl
						? "Cliquez pour lancer la video"
						: "Cliquez pour voir la recette en video"}
				</p>
			</div>
		</div>
	);
}
