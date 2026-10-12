import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { NavTab } from "../components/Navbar";

interface HomeProps {
	setActiveTab: (tab: NavTab) => void;
}

interface VisualAssetProps {
	src: string;
	alt: string;
	caption: string;
	mediaClassName: string;
	priority?: boolean;
}

const focusRing =
	"cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25";
const container = "mx-auto w-[calc(100%-2rem)] max-w-[1200px] sm:w-[calc(100%-3rem)]";

const VisualAsset: React.FC<VisualAssetProps> = ({
	src,
	alt,
	caption,
	mediaClassName,
	priority = false,
}) => {
	const [imageMissing, setImageMissing] = useState(false);
	const filename = src.split("/").pop();

	return (
		<figure className="m-0" data-asset={src}>
			<div
				className={`relative overflow-hidden rounded-[12px] border border-line bg-slate-100 ${mediaClassName}`}
			>
				{!imageMissing ? (
					<img
						className="block size-full object-cover"
						src={src}
						alt={alt}
						loading={priority ? "eager" : "lazy"}
						fetchPriority={priority ? "high" : "auto"}
						onError={() => setImageMissing(true)}
					/>
				) : (
					<div
						className="flex size-full min-h-[inherit] flex-col justify-end p-6 text-slate-700 sm:p-8"
						role="img"
						aria-label={alt}
					>
						<span className="text-[13px] font-semibold text-ink">Visual ready for replacement</span>
						<span className="mt-2 max-w-[34ch] text-[13px] leading-5 text-muted">{alt}</span>
						<code className="mt-4 w-fit border-b border-slate-400 pb-1 text-[11px] text-slate-600">
							{filename}
						</code>
					</div>
				)}
			</div>
			<figcaption className="mt-3 text-[13px] leading-5 text-muted">{caption}</figcaption>
		</figure>
	);
};

const journey: Array<{ title: string; description: string; action: string; tab: NavTab }> = [
	{
		title: "Predict",
		description: "Describe the road, weather, traffic, and visibility conditions you know.",
		action: "Open predictor",
		tab: "predict",
	},
	{
		title: "Compare",
		description: "Change one condition at a time and see how the severity outlook responds.",
		action: "Compare scenarios",
		tab: "whatif",
	},
	{
		title: "Explain",
		description: "Inspect the conditions that pushed the prediction higher or lower.",
		action: "Read explanations",
		tab: "explain",
	},
	{
		title: "Locate",
		description: "Place the result beside historical patterns across Indian cities and states.",
		action: "Explore the map",
		tab: "map",
	},
];

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
	const primaryButton = `inline-flex min-h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-[10px] border border-brand bg-brand px-5 text-[15px] font-semibold text-white transition-colors hover:border-brand-deep hover:bg-brand-deep active:translate-y-px ${focusRing}`;
	const secondaryButton = `inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-[10px] border border-slate-300 bg-transparent px-5 text-[15px] font-semibold text-ink transition-colors hover:border-slate-400 hover:bg-surface active:translate-y-px ${focusRing}`;
	const textLink = `inline-flex items-center gap-2 border-0 bg-transparent py-2 text-[14px] font-semibold text-brand-deep transition-colors hover:text-brand ${focusRing}`;

	return (
		<div className="bg-canvas text-ink">
			<section
				className="grid min-h-[calc(100dvh-4rem)] items-center py-10 sm:py-12 lg:py-14"
				aria-labelledby="landing-title"
			>
				<div
					className={`${container} grid items-center gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(500px,1.18fr)] lg:gap-[clamp(3rem,7vw,6.5rem)]`}
				>
					<div className="max-w-[560px] lg:pb-8">
						<p className="mb-5 text-[14px] font-semibold text-brand-deep">
							Road safety intelligence
						</p>
						<h1
							id="landing-title"
							className="m-0 max-w-[14ch] text-[clamp(3rem,5.5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.052em] text-ink"
						>
							See road risk before impact.
						</h1>
						<p className="mt-6 max-w-[510px] text-[clamp(1rem,1.45vw,1.16rem)] leading-8 text-muted">
							Model road, weather, traffic, and location conditions to predict severity and
							understand what changes the outcome.
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
							<button
								className={primaryButton}
								type="button"
								onClick={() => setActiveTab("predict")}
							>
								Predict severity
								<ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
							</button>
							<button className={secondaryButton} type="button" onClick={() => setActiveTab("map")}>
								Explore the map
							</button>
						</div>
					</div>

					<VisualAsset
						src="/visuals/landing-hero-road.webp"
						alt="A high-angle view of a modern Indian road junction with moving traffic"
						caption="A road-level view of the conditions that shape each prediction."
						mediaClassName="aspect-[5/4] min-h-[340px] sm:min-h-[440px] lg:min-h-[min(64vh,640px)]"
						priority
					/>
				</div>
			</section>

			<section className="border-y border-line bg-surface" aria-label="Platform evidence">
				<div className={`${container} grid sm:grid-cols-3 lg:grid-cols-[1.55fr_repeat(3,1fr)]`}>
					<div className="col-span-full flex min-h-24 items-center border-b border-line py-5 lg:col-span-1 lg:border-b-0 lg:pr-8">
						<p className="m-0 max-w-[260px] text-[15px] font-semibold leading-6 text-ink">
							Evidence from two independent road-safety datasets
						</p>
					</div>
					{[
						["20,000", "prediction records"],
						["5", "models evaluated"],
						["15", "cities represented"],
					].map(([value, label], index) => (
						<div
							className={`flex min-h-24 flex-col justify-center border-b border-line py-5 last:border-b-0 sm:border-b-0 sm:border-l sm:px-5 lg:px-7 ${index === 0 ? "sm:border-l-0 lg:border-l" : ""}`}
							key={label}
						>
							<strong className="text-[24px] font-semibold tracking-[-0.035em] text-ink">
								{value}
							</strong>
							<span className="mt-1 text-[13px] text-muted">{label}</span>
						</div>
					))}
				</div>
			</section>

			<section className="py-20 lg:py-28" aria-labelledby="context-title">
				<div className={container}>
					<div className="mb-10 max-w-[660px] lg:mb-12">
						<h2
							id="context-title"
							className="m-0 max-w-[14ch] text-[clamp(2.35rem,4.5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.047em]"
						>
							A prediction is only useful in context.
						</h2>
						<p className="mt-5 max-w-[550px] text-[17px] leading-7 text-muted">
							Read a forecast beside its location, conditions, and historical pattern.
						</p>
					</div>
					<div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(270px,0.6fr)] lg:gap-[clamp(2.5rem,6vw,5rem)]">
						<VisualAsset
							src="/visuals/landing-map-overview.webp"
							alt="AcciPredict map showing historical accident concentrations across India"
							caption="Historical incidents remain explorable by place, severity, cause, and conditions."
							mediaClassName="aspect-[10/7] min-h-[340px] sm:min-h-[450px] lg:min-h-[560px]"
						/>
						<div className="lg:pb-8">
							{[
								{
									title: "Read the place",
									body: "Filter historical incidents by city, state, weather, cause, and severity.",
								},
								{
									title: "Read the conditions",
									body: "Trace a forecast back to the road and environmental inputs that shaped it.",
								},
							].map((item) => (
								<div className="border-b border-line py-7 first:border-t" key={item.title}>
									<h3 className="text-[18px] font-semibold tracking-[-0.018em]">{item.title}</h3>
									<p className="mt-2 text-[14px] leading-6 text-muted">{item.body}</p>
								</div>
							))}
							<button
								className="mt-4 inline-flex cursor-pointer border-0 bg-transparent py-2 text-[14px] font-semibold text-brand-deep transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
								type="button"
								onClick={() => setActiveTab("analytics")}
							>
								Explore accident insights
							</button>
						</div>
					</div>
				</div>
			</section>

			<section
				className="border-y border-line bg-[#f0f4f9] py-20 lg:py-28"
				aria-labelledby="journey-title"
			>
				<div className={container}>
					<div className="max-w-[650px]">
						<h2
							id="journey-title"
							className="m-0 max-w-[14ch] text-[clamp(2.35rem,4.5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.047em]"
						>
							Follow the decision, not the dashboard.
						</h2>
						<p className="mt-5 max-w-[540px] text-[17px] leading-7 text-muted">
							Each view answers the next practical question without losing the original scenario.
						</p>
					</div>
					<div className="mt-12 grid border-t border-slate-300 md:grid-cols-2 lg:grid-cols-4">
						{journey.map((item, index) => (
							<button
								key={item.title}
								className={`group flex min-h-[245px] w-full cursor-pointer flex-col items-start border-0 border-b border-slate-300 bg-transparent py-7 text-left transition-colors hover:bg-surface/70 md:px-7 ${index % 2 === 0 ? "md:border-r" : ""} lg:border-r lg:px-6 lg:last:border-r-0 ${focusRing}`}
								type="button"
								onClick={() => setActiveTab(item.tab)}
							>
								<span className="text-[13px] font-semibold text-brand-deep">
									{String(index + 1).padStart(2, "0")}
								</span>
								<strong className="mt-9 text-[25px] font-semibold tracking-[-0.035em] text-ink">
									{item.title}
								</strong>
								<span className="mt-3 max-w-[260px] text-[14px] leading-6 text-muted">
									{item.description}
								</span>
								<span className="mt-auto pt-8 text-[13px] font-semibold text-brand-deep group-hover:text-brand">
									{item.action}
								</span>
							</button>
						))}
					</div>
				</div>
			</section>

			<section className="py-20 lg:py-28" aria-labelledby="method-title">
				<div
					className={`${container} grid items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] lg:gap-[clamp(3.5rem,8vw,7rem)]`}
				>
					<VisualAsset
						src="/visuals/landing-explanation.webp"
						alt="AcciPredict explanation view with clear contributing road and weather factors"
						caption="Contributing factors show how each input moved an individual result."
						mediaClassName="aspect-[7/6] min-h-[340px] sm:min-h-[440px] lg:min-h-[500px]"
					/>
					<div>
						<h2
							id="method-title"
							className="m-0 max-w-[13ch] text-[clamp(2.35rem,4.5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.047em]"
						>
							A result you can question.
						</h2>
						<p className="mt-5 max-w-[540px] text-[17px] leading-7 text-muted">
							The model is designed to show its evidence and protect the boundary between its source
							datasets.
						</p>
						<div className="mt-8 grid border-t border-line">
							{[
								[
									"Separate sources",
									"Prediction records and detailed factor records are never joined.",
								],
								["Fair comparison", "Models are evaluated against the same held-out test split."],
								[
									"Visible reasoning",
									"SHAP factors show which conditions shaped an individual result.",
								],
							].map(([title, body]) => (
								<div
									className="grid gap-2 border-b border-line py-5 sm:grid-cols-[130px_1fr] sm:gap-5"
									key={title}
								>
									<h3 className="text-[14px] font-semibold text-ink">{title}</h3>
									<p className="text-[14px] leading-6 text-muted">{body}</p>
								</div>
							))}
						</div>
						<button
							className={`${textLink} mt-4`}
							type="button"
							onClick={() => setActiveTab("explain")}
						>
							See how explanations work <ArrowRight size={16} />
						</button>
					</div>
				</div>
			</section>

			<section className="border-t border-line bg-surface" aria-labelledby="final-title">
				<div
					className={`${container} grid min-h-[270px] items-center gap-8 py-14 md:grid-cols-[1fr_auto] md:py-16`}
				>
					<div>
						<h2
							id="final-title"
							className="m-0 max-w-[16ch] text-[clamp(2.2rem,4vw,3.7rem)] font-semibold leading-[1.03] tracking-[-0.045em]"
						>
							Start with the conditions you know.
						</h2>
						<p className="mt-4 max-w-[520px] text-[16px] leading-7 text-muted">
							Build a road scenario, then inspect the predicted severity and its explanation.
						</p>
					</div>
					<button className={primaryButton} type="button" onClick={() => setActiveTab("predict")}>
						Predict severity <ArrowRight size={17} />
					</button>
				</div>
			</section>
		</div>
	);
};
