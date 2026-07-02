import Foundation

/// Rule-based plant-care answers for devices without Apple Intelligence.
/// Pure Foundation code: keyword topics plus a species profile table,
/// composed into a grounded, practical reply.
enum PlantCareKnowledgeBase {
    struct SpeciesProfile {
        let matchTerms: [String]
        let displayName: String
        let watering: String
        let light: String
        let quirk: String
    }

    struct Topic {
        let keywords: [String]
        let answer: (String, SpeciesProfile?) -> String
    }

    // MARK: - Species profiles

    static let speciesProfiles: [SpeciesProfile] = [
        SpeciesProfile(
            matchTerms: ["monstera"],
            displayName: "Monstera",
            watering: "water when the top 2 inches of soil are dry, roughly every 1–2 weeks",
            light: "bright indirect light; harsh direct sun scorches the leaves",
            quirk: "new leaves unfurl with more splits when light is generous — rotate the pot weekly so it grows evenly"
        ),
        SpeciesProfile(
            matchTerms: ["pothos", "epipremnum"],
            displayName: "Pothos",
            watering: "let the top half of the soil dry out between waterings",
            light: "tolerates low light but variegation fades without brighter spots",
            quirk: "drooping vines that perk up after watering are its built-in moisture meter"
        ),
        SpeciesProfile(
            matchTerms: ["calathea", "orbifolia", "prayer plant", "maranta"],
            displayName: "Calathea",
            watering: "keep soil lightly moist (never soggy) and prefer filtered or rain water",
            light: "medium indirect light; direct sun bleaches the patterns",
            quirk: "crispy edges almost always mean low humidity or minerals in tap water — a humidity tray helps a lot"
        ),
        SpeciesProfile(
            matchTerms: ["ficus elastica", "rubber"],
            displayName: "Rubber plant",
            watering: "water when the top inch is dry, and less in winter",
            light: "bright indirect light keeps the leaves glossy and dense",
            quirk: "dust builds up on the broad leaves — wipe them monthly so it can actually photosynthesize"
        ),
        SpeciesProfile(
            matchTerms: ["fiddle", "lyrata"],
            displayName: "Fiddle-leaf fig",
            watering: "thorough soak when the top 2 inches are dry; hates both drought and swampy soil",
            light: "lots of bright light, ideally near an east or south window",
            quirk: "it sulks after being moved — pick a spot and let it settle instead of chasing the perfect corner"
        ),
        SpeciesProfile(
            matchTerms: ["snake plant", "sansevieria", "dracaena trifasciata"],
            displayName: "Snake plant",
            watering: "sparingly — every 2–6 weeks, only when soil is fully dry",
            light: "handles almost anything from low light to full sun",
            quirk: "overwatering is the only common way to kill it; mushy leaf bases mean back way off"
        ),
        SpeciesProfile(
            matchTerms: ["zz", "zamioculcas"],
            displayName: "ZZ plant",
            watering: "every 2–4 weeks; its rhizomes store water like a camel",
            light: "low to bright indirect light",
            quirk: "yellowing usually means too much water, not too little"
        ),
        SpeciesProfile(
            matchTerms: ["philodendron"],
            displayName: "Philodendron",
            watering: "water when the top inch or two is dry",
            light: "medium to bright indirect light",
            quirk: "leggy stretches with small leaves are a light complaint — move it brighter and it fills back in"
        ),
        SpeciesProfile(
            matchTerms: ["succulent", "echeveria", "haworthia", "jade", "crassula"],
            displayName: "Succulent",
            watering: "soak-and-dry: drench, then wait until soil is bone dry — often 2–3 weeks",
            light: "as much direct sun as you can give indoors",
            quirk: "stretching toward the window (etiolation) means it's starving for light"
        ),
        SpeciesProfile(
            matchTerms: ["cactus", "cacti"],
            displayName: "Cactus",
            watering: "sparingly in the growing season, barely at all in winter",
            light: "full sun",
            quirk: "a south-facing windowsill is its happy place; rot from wet winter soil is its main enemy"
        ),
        SpeciesProfile(
            matchTerms: ["orchid", "phalaenopsis"],
            displayName: "Orchid",
            watering: "about weekly — soak the bark, drain fully, never leave water in the crown",
            light: "bright indirect light; roots in a clear pot should look silvery-green",
            quirk: "it blooms on the same spike more than once — don't cut a green spike after flowers drop"
        ),
        SpeciesProfile(
            matchTerms: ["fern", "boston", "nephrolepis"],
            displayName: "Fern",
            watering: "keep soil consistently moist — ferns forgive little drought",
            light: "medium indirect light, no harsh sun",
            quirk: "bathrooms and kitchens suit them; dry air makes fronds shed like confetti"
        ),
        SpeciesProfile(
            matchTerms: ["peace lily", "spathiphyllum"],
            displayName: "Peace lily",
            watering: "when the leaves just start to soften — it dramatically droops on cue, then recovers fast",
            light: "medium indirect light; blooms more with brighter light",
            quirk: "brown tips usually track tap-water minerals or dry air rather than disease"
        ),
        SpeciesProfile(
            matchTerms: ["spider plant", "chlorophytum"],
            displayName: "Spider plant",
            watering: "evenly moist in summer, drier in winter",
            light: "bright indirect light",
            quirk: "the babies on runners root easily in water — free plants for friends and family"
        ),
        SpeciesProfile(
            matchTerms: ["aloe"],
            displayName: "Aloe",
            watering: "deeply but rarely — every 2–3 weeks, less in winter",
            light: "bright light with some direct sun",
            quirk: "thin, curled leaves mean thirsty; mushy, dark leaves mean drowned"
        ),
    ]

    static func profile(forSpecies species: String) -> SpeciesProfile? {
        let lowered = species.lowercased()
        return speciesProfiles.first { profile in
            profile.matchTerms.contains { lowered.contains($0) }
        }
    }

    // MARK: - Topics

    private static let topics: [Topic] = [
        Topic(keywords: ["water", "watering", "thirsty", "dry soil", "overwater"]) { name, profile in
            var answer = "\(name): check the soil before the calendar — push a finger in and water only when the top layer is dry."
            if let profile {
                answer += " For a \(profile.displayName.lowercased()), the usual rhythm is to \(profile.watering)."
            }
            answer += " If leaves droop but the soil is wet, hold off and improve airflow; if soil is bone dry and pulling from the pot edge, bottom-water for 15 minutes and drain."
            return answer
        },
        Topic(keywords: ["yellow", "brown", "spot", "spots", "tip", "tips", "edge", "edges", "crispy"]) { name, profile in
            var answer = "\(name): yellowing or browning usually traces to water stress (too much or too little), light, pests, or simply old leaves retiring."
            if let profile {
                answer += " Keep in mind: \(profile.quirk)."
            }
            answer += " Compare your latest photo with the previous one, check leaf undersides for pests, and if it's spreading fast, mark the plant important so you track it daily."
            return answer
        },
        Topic(keywords: ["light", "sun", "window", "dark", "shade", "leaning"]) { name, profile in
            var answer = "\(name): most houseplants want bright indirect light — near a window but out of harsh midday sun."
            if let profile {
                answer += " Specifically, \(profile.displayName.lowercased())s prefer \(profile.light)."
            }
            answer += " Rotate the pot a quarter turn each week and use your photo timeline to catch leaning or fading early."
            return answer
        },
        Topic(keywords: ["droop", "drooping", "wilt", "wilting", "limp", "sad"]) { name, profile in
            var answer = "\(name): drooping is a symptom with two opposite causes — feel the soil first. Dry and light pot: water deeply. Wet and heavy pot: too much water, so let it dry and check the roots for rot."
            if let profile {
                answer += " (\(profile.displayName)s: \(profile.quirk).)"
            }
            answer += " Sudden drooping after a move is often just shock; give it a week before changing anything else."
            return answer
        },
        Topic(keywords: ["pest", "bug", "gnat", "gnats", "mite", "mites", "mealy", "aphid", "webbing", "sticky"]) { name, _ in
            "\(name): isolate it from your other plants first. Fungus gnats mean chronically wet topsoil — let the top dry and use sticky traps. Fine webbing points to spider mites: shower the plant and treat weekly with insecticidal soap or neem. White cottony tufts are mealybugs: dab each one with rubbing alcohol on a cotton swab. Recheck leaf undersides every few days for two weeks."
        },
        Topic(keywords: ["repot", "repotting", "pot", "root bound", "rootbound", "roots"]) { name, _ in
            "\(name): repot when roots circle the pot or grow out the drainage holes — usually every 1–2 years. Go up just one pot size (about 2 inches wider), use fresh well-draining mix, and water lightly after. Spring is the friendliest season for it. Expect a couple of quiet weeks afterward while the roots settle."
        },
        Topic(keywords: ["fertiliz", "feed", "food", "nutrient"]) { name, _ in
            "\(name): feed during spring and summer growth with a balanced liquid fertilizer diluted to half strength, roughly monthly. Skip feeding in winter and for 6–8 weeks after repotting into fresh mix. If you see white crust on the soil surface, flush the pot with plain water — that's salt buildup."
        },
        Topic(keywords: ["humid", "humidity", "mist", "dry air"]) { name, profile in
            var answer = "\(name): most tropical houseplants like 40–60% humidity. Grouping plants together or a pebble tray with water raises it more reliably than misting, which only lasts minutes."
            if let profile, profile.matchTerms.contains(where: { ["calathea", "fern", "boston", "orchid"].contains($0) }) {
                answer += " \(profile.displayName)s especially: \(profile.quirk)."
            }
            answer += " Keep plants away from heater vents and drafty windows — both dry the air fast."
            return answer
        },
        Topic(keywords: ["propagat", "cutting", "cuttings", "clone"]) { name, _ in
            "\(name): most vining and stem plants propagate from a cutting with at least one node — cut just below it, put the node in water, and refresh the water weekly. Roots typically show in 2–6 weeks; pot up once they're an inch or two long. Take cuttings in spring or summer for the best odds, and log the date with a photo so you can track progress."
        },
        Topic(keywords: ["drop", "dropping", "losing leaves", "leaf fall", "shed"]) { name, _ in
            "\(name): a plant dropping multiple leaves is usually reacting to a change — new spot, cold draft, big watering swing, or repotting. One old lower leaf now and then is normal retirement. Stabilize its conditions, water consistently, and photograph it every few days; if the drop continues past two weeks, look closer at roots and pests."
        },
        Topic(keywords: ["toxic", "poison", "cat", "dog", "pet", "baby", "safe"]) { name, _ in
            "\(name): treat unknown houseplants as mildly toxic by default — many common ones (pothos, monstera, philodendron, peace lily) irritate mouths and stomachs if chewed. Keep them out of reach of pets and toddlers, and check a source like the ASPCA plant list for your exact species. If a pet chews a plant and seems unwell, call your vet with the species name."
        },
        Topic(keywords: ["new leaf", "growth", "growing", "bigger", "unfurl"]) { name, profile in
            var answer = "\(name): new growth is the best health signal there is. Support it with steady light, consistent watering, and a little food during the growing season."
            if let profile {
                answer += " \(profile.displayName) tip: \(profile.quirk)."
            }
            answer += " Photograph the new leaf now and again in a week — the comparison slider makes the progress obvious."
            return answer
        },
    ]

    // MARK: - Answering

    static func answer(prompt: String, plant: Plant?) -> String {
        let lowered = prompt.lowercased()

        guard let plant else {
            return "I can help with watering, light, pests, repotting, propagation, and more — even offline. Scope the chat to one of your plants and I'll ground the advice in its journal, or just ask a general question like “why are my pothos leaves yellow?”"
        }

        let profile = profile(forSpecies: plant.species)
        var parts: [String] = []

        // Lead with the overdue reminder when relevant.
        if let due = PlantInsights.nextCareDue(for: plant), due < 0 {
            let days = abs(due)
            parts.append("First: \(plant.name) is \(days) day\(days == 1 ? "" : "s") overdue for care, so start by checking the soil.")
        }

        if let topic = topics.first(where: { topic in topic.keywords.contains { lowered.contains($0) } }) {
            parts.append(topic.answer(plant.name, profile))
        } else {
            var fallback = "\(plant.name): based on your journal, pick one observable thing to check this week — soil moisture, new growth, leaf color, or posture."
            if let profile {
                fallback += " As a \(profile.displayName.lowercased()), remember: \(profile.watering), and it does best with \(profile.light)."
            }
            fallback += " Add a progress photo after any care change so the timeline can show you the before and after."
            parts.append(fallback)
        }

        return parts.joined(separator: "\n\n")
    }
}
