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
		<div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-all flex flex-col h-full">
			{/* Marge rouge - style cahier */}
			<div className="absolute left-8 top-0 bottom-0 w-px bg-rose-500/40" />

			{/* Trous de reliure */}
			<div className="absolute left-2 top-[15%] w-3 h-3 rounded-full border-2 border-foreground/20" />
			<div className="absolute left-2 top-[45%] w-3 h-3 rounded-full border-2 border-foreground/20" />
			<div className="absolute left-2 top-[75%] w-3 h-3 rounded-full border-2 border-foreground/20" />

			<div className="p-6 pl-12 flex flex-col h-full overflow-hidden">
				{/* Header avec titre et meta */}
				<div className="mb-4 pb-4 border-b border-foreground/15 shrink-0">
					<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
						<span className="px-2 py-1 rounded-full border border-border capitalize">
							{recipe.sourcePlatform}
						</span>
						<div className="flex items-center gap-1">
							<Clock className="w-3 h-3" />
							<span>{displayTime}</span>
						</div>
						{recipe.servings && (
							<div className="flex items-center gap-1">
								<Users className="w-3 h-3" />
								<span>{recipe.servings} pers.</span>
							</div>
						)}
					</div>
					<h2 className="text-xl font-bold text-foreground line-clamp-2">
						{recipe.title}
					</h2>
				</div>

				{/* Liste des ingredients - 2 colonnes style cahier */}
				<div className="flex-1 overflow-y-auto min-h-0">
					<h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3 sticky top-0 bg-card py-1">
						Ingrédients
					</h3>
					<div className="columns-2 gap-4">
						{recipe.ingredients.map((ingredient, i) => (
							<div
								key={i}
								className="flex items-start gap-2 cursor-pointer group/item py-2 break-inside-avoid border-b border-foreground/10"
								onClick={() => toggleIngredient(i)}
							>
								<div
									className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 ${
										checkedIngredients.includes(i)
											? "bg-foreground border-foreground"
											: "border-foreground/30 hover:border-foreground/50"
									}`}
								>
									{checkedIngredients.includes(i) && (
										<Check className="w-2.5 h-2.5 text-background" />
									)}
								</div>
								<span
									className={`text-sm leading-tight transition-all ${
										checkedIngredients.includes(i)
											? "text-muted-foreground line-through"
											: "text-foreground"
									}`}
								>
									{formatIngredient(ingredient)}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
