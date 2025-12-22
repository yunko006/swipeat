"use client";

import { useState } from "react";
import { ExploreHeader } from "@/components/explore/explore-header";
import { SearchBar } from "@/components/explore/search-bar";
import { SortButtons } from "@/components/explore/sort-buttons";
import { RecipeGrid } from "@/components/explore/recipe-grid";
import { api } from "@/trpc/react";

export default function ExplorePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"trending" | "recent" | "quick">(
		"recent",
	);

	const { data, isLoading } = api.explore.list.useQuery({
		search: searchQuery || undefined,
		sortBy,
		limit: 50,
		offset: 0,
	});

	const recipes = data?.items ?? [];

	return (
		<div className="min-h-screen bg-background theme-vercel-dark">
			<header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<ExploreHeader />
					<SearchBar value={searchQuery} onChange={setSearchQuery} />
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 py-6">
				<SortButtons value={sortBy} onChange={setSortBy} />
				<RecipeGrid
					recipes={recipes}
					isLoading={isLoading}
					total={data?.total}
				/>
			</main>
		</div>
	);
}
