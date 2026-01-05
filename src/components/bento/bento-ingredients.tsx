"use client";

import { useState } from "react";
import { Check, Clock, Users } from "lucide-react";

interface BentoIngredientsProps {
	recipe: {
		title: string;
		sourcePlatform: string;
		prepTimeMinutes: number | null;
		cookTimeMinutes: number | null;
		servings: number | null;
		ingredients: Array<{
			name: string;
			quantity?: string;
			unit?: string;
			notes?: string;
		}>;
	};
}

export function BentoIngredients({ recipe }: BentoIngredientsProps) {
	const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

	const toggleIngredient = (index: number) => {
		setCheckedIngredients((prev) =>
			prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
		);
	};

	const formatIngredient = (ingredient: {
		name: string;
		quantity?: string;
		unit?: string;
		notes?: string;
	}) => {
		const parts = [];
		if (ingredient.quantity) parts.push(ingredient.quantity);
		if (ingredient.unit) parts.push(ingredient.unit);
		parts.push(ingredient.name);
		if (ingredient.notes) parts.push(`(${ingredient.notes})`);
		return parts.join(" ");
	};

	const totalTime =
		(recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
	const displayTime =
		totalTime > 0 ? `${totalTime} min` : "Temps non spécifié";

	return (
		<div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-all">
			{/* Ligne horizontale sous le header */}
			<div className="absolute top-[140px] left-0 right-0 h-px bg-foreground/15" />
			{/* Marge rouge */}
			<div className="absolute left-8 top-[140px] bottom-0 w-px bg-rose-500/40" />

			{/* Trous de reliure */}
			<div className="absolute left-2 top-[180px] w-3 h-3 rounded-full border-2 border-foreground/20" />
			<div className="absolute left-2 top-[280px] w-3 h-3 rounded-full border-2 border-foreground/20" />
			<div className="absolute left-2 top-[380px] w-3 h-3 rounded-full border-2 border-foreground/20" />

			<div className="p-6">
				{/* Header avec titre et meta */}
				<div className="mb-6 pb-6">
					<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
						<span className="px-2 py-1 rounded-full border border-border capitalize">
							{recipe.sourcePlatform}
						</span>
					</div>
					<h2 className="text-3xl md:text-4xl font-bold text-foreground">
						{recipe.title}
					</h2>
					<div className="flex gap-4 mt-3 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Clock className="w-4 h-4" />
							<span>{displayTime}</span>
						</div>
						{recipe.servings && (
							<div className="flex items-center gap-1">
								<Users className="w-4 h-4" />
								<span>{recipe.servings} pers.</span>
							</div>
						)}
					</div>
				</div>

				{/* Liste des ingredients */}
				<div className="pl-6">
					<h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
						Liste des ingredients
					</h3>
					<div className="space-y-0">
						{Array.from({
							length: Math.ceil(recipe.ingredients.length / 2),
						}).map((_, rowIndex) => (
							<div key={rowIndex} className="border-b border-foreground/15">
								<div className="grid grid-cols-2 gap-x-6">
									{[0, 1].map((colIndex) => {
										const i = rowIndex * 2 + colIndex;
										if (i >= recipe.ingredients.length)
											return <div key={colIndex} className="py-3" />;
										return (
											<div
												key={colIndex}
												className="flex items-center gap-3 cursor-pointer group/item py-3"
												onClick={() => toggleIngredient(i)}
											>
												<div
													className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
														checkedIngredients.includes(i)
															? "bg-foreground border-foreground"
															: "border-foreground/30 hover:border-foreground/50"
													}`}
												>
													{checkedIngredients.includes(i) && (
														<Check className="w-3 h-3 text-background" />
													)}
												</div>
												<span
													className={`text-sm transition-all ${
														checkedIngredients.includes(i)
															? "text-muted-foreground line-through"
															: "text-foreground"
													}`}
												>
													{formatIngredient(recipe.ingredients[i]!)}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
