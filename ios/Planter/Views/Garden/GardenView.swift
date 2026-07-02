import SwiftData
import SwiftUI

struct GardenView: View {
    @Environment(AppRouter.self) private var router
    @Query(sort: \Plant.createdAt, order: .reverse) private var plants: [Plant]

    @State private var path = NavigationPath()
    @State private var showingAddPlant = false

    private var totalPhotos: Int {
        plants.reduce(0) { $0 + $1.photos.count }
    }

    private var attentionCount: Int {
        plants.filter { PlantInsights.needsAttention($0) }.count
    }

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    statsHeader
                    GeometricDivider()
                    if plants.isEmpty {
                        EmptyStateView(
                            title: "Plant your first record",
                            message: "Add a plant, take a photo, and Planter will keep the growth story for you.",
                            actionTitle: "Add plant"
                        ) {
                            showingAddPlant = true
                        }
                        .padding(.top, 40)
                    } else {
                        plantGrid
                    }
                }
                .padding(PlanterTheme.screenPadding)
            }
            .background(Color.planterCream)
            .navigationTitle("Garden")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingAddPlant = true
                    } label: {
                        Image(systemName: "plus")
                            .font(.body.weight(.bold))
                    }
                    .accessibilityLabel("Add plant")
                }
            }
            .sheet(isPresented: $showingAddPlant) {
                AddEditPlantView()
            }
            .navigationDestination(for: Plant.self) { plant in
                PlantDetailView(plant: plant)
            }
            .onChange(of: router.pendingPlantID) { _, plantID in
                guard let plantID else { return }
                router.pendingPlantID = nil
                if let plant = plants.first(where: { $0.id == plantID }) {
                    path.append(plant)
                }
            }
        }
    }

    private var statsHeader: some View {
        HStack(spacing: 10) {
            StatTile(systemImage: "leaf.fill", value: "\(plants.count)", label: "Plants")
            StatTile(systemImage: "camera.fill", value: "\(totalPhotos)", label: "Photos")
            StatTile(systemImage: "bell.fill", value: "\(attentionCount)", label: "Attention")
        }
    }

    private var plantGrid: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 165), spacing: 12)], spacing: 12) {
            ForEach(plants) { plant in
                NavigationLink(value: plant) {
                    PlantCardView(plant: plant)
                }
                .buttonStyle(.plain)
            }
        }
    }
}
