import SwiftData
import SwiftUI

struct ChatView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.scenePhase) private var scenePhase
    @Environment(AppRouter.self) private var router

    @Query(sort: \ChatMessage.createdAt) private var allMessages: [ChatMessage]
    @Query(sort: \Plant.name) private var plants: [Plant]

    @State private var viewModel = ChatViewModel()
    @State private var prompt = ""
    @State private var scopedPlantID: UUID?

    private var scopedPlant: Plant? {
        guard let scopedPlantID else { return nil }
        return plants.first { $0.id == scopedPlantID }
    }

    /// General messages plus the scoped plant's thread, in time order.
    private var visibleMessages: [ChatMessage] {
        allMessages.filter { message in
            message.plant == nil || message.plant?.id == scopedPlantID
        }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 10) {
                AssistantStatusBanner(status: viewModel.status)
                    .padding(.horizontal, PlanterTheme.screenPadding)

                messageList

                inputBar
                    .padding(.horizontal, PlanterTheme.screenPadding)
                    .padding(.bottom, 8)
            }
            .background(Color.planterCream)
            .navigationTitle("Assistant")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    plantScopeMenu
                }
            }
        }
        .onAppear {
            viewModel.prewarm()
            adoptRouterScope()
        }
        .onChange(of: router.chatScopePlantID) { _, _ in
            adoptRouterScope()
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                viewModel.refreshAvailability()
            }
        }
    }

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 10) {
                    if visibleMessages.isEmpty && viewModel.inFlightReply == nil {
                        emptyState
                    }
                    ForEach(visibleMessages) { message in
                        ChatBubbleView(content: message.content, isUser: message.role == .user)
                            .id(message.id)
                    }
                    if let inFlight = viewModel.inFlightReply {
                        ChatBubbleView(content: inFlight.isEmpty ? "…" : inFlight, isUser: false)
                            .id("in-flight")
                    }
                }
                .padding(PlanterTheme.screenPadding)
            }
            .defaultScrollAnchor(.bottom)
            .onChange(of: viewModel.inFlightReply) { _, _ in
                proxy.scrollTo("in-flight", anchor: .bottom)
            }
            .onChange(of: visibleMessages.count) { _, _ in
                if let last = visibleMessages.last {
                    proxy.scrollTo(last.id, anchor: .bottom)
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            MarigoldMotif(size: 90)
            Text("Ask about your plants")
                .font(.planterTitle(22))
                .foregroundStyle(Color.planterInk)
            Text("Watering, light, yellow leaves, pests, repotting… Scope the chat to a plant and the answers use its journal.")
                .font(.subheadline)
                .foregroundStyle(Color.planterInk.opacity(0.6))
                .multilineTextAlignment(.center)
        }
        .padding(.top, 40)
    }

    private var plantScopeMenu: some View {
        Menu {
            Button {
                scopedPlantID = nil
            } label: {
                if scopedPlantID == nil {
                    Label("General", systemImage: "checkmark")
                } else {
                    Text("General")
                }
            }
            ForEach(plants) { plant in
                Button {
                    scopedPlantID = plant.id
                } label: {
                    if scopedPlantID == plant.id {
                        Label(plant.name, systemImage: "checkmark")
                    } else {
                        Text(plant.name)
                    }
                }
            }
        } label: {
            Label(scopedPlant?.name ?? "General", systemImage: "leaf")
                .font(.subheadline.weight(.semibold))
        }
    }

    private var inputBar: some View {
        HStack(spacing: 8) {
            TextField(
                scopedPlant.map { "Ask about \($0.name)…" } ?? "Ask about watering, light, pests…",
                text: $prompt,
                axis: .vertical
            )
            .lineLimit(1...4)
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(Color.planterPaper)
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .stroke(Color.planterInk.opacity(0.1))
                    )
            )
            .onSubmit(send)

            Button(action: send) {
                Image(systemName: "arrow.up")
                    .font(.body.weight(.bold))
                    .foregroundStyle(Color.planterPaper)
                    .padding(12)
                    .background(Circle().fill(Color.planterMoss))
            }
            .disabled(prompt.trimmingCharacters(in: .whitespaces).isEmpty || viewModel.isResponding)
            .accessibilityLabel("Send message")
        }
    }

    private func send() {
        viewModel.send(
            prompt: prompt,
            plant: scopedPlant,
            history: visibleMessages,
            context: modelContext
        )
        prompt = ""
    }

    private func adoptRouterScope() {
        if let plantID = router.chatScopePlantID {
            scopedPlantID = plantID
            router.chatScopePlantID = nil
        }
    }
}
