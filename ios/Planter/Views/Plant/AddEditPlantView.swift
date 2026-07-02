import PhotosUI
import SwiftData
import SwiftUI
import UIKit

/// Sheet used for both creating and editing a plant.
struct AddEditPlantView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    /// nil = creating a new plant.
    var plant: Plant?

    @State private var name = ""
    @State private var species = ""
    @State private var location = ""
    @State private var careGoal = ""
    @State private var reminderDays: Int? = 7
    @State private var firstPhotoData: Data?
    @State private var firstPhotoCaption = ""
    @State private var libraryItem: PhotosPickerItem?
    @State private var showingCamera = false

    private var isEditing: Bool { plant != nil }

    private let reminderChoices: [(label: String, days: Int?)] = [
        ("None", nil),
        ("Every 2 days", 2),
        ("Every 4 days", 4),
        ("Weekly", 7),
        ("Every 2 weeks", 14),
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section("Plant") {
                    TextField("Name (e.g. Ruby Rubber Plant)", text: $name)
                    TextField("Species (e.g. Ficus elastica)", text: $species)
                    TextField("Location (e.g. East window shelf)", text: $location)
                }
                Section("Care goal") {
                    TextField("What do you want to watch or improve?", text: $careGoal, axis: .vertical)
                        .lineLimit(3...6)
                }
                Section("Care reminder") {
                    Picker("Remind me", selection: $reminderDays) {
                        ForEach(reminderChoices, id: \.days) { choice in
                            Text(choice.label).tag(choice.days)
                        }
                    }
                }
                if !isEditing {
                    Section("First photo (optional)") {
                        firstPhotoSection
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(Color.planterCream)
            .navigationTitle(isEditing ? "Edit plant" : "New plant")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(isEditing ? "Save" : "Create") { save() }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear(perform: populateIfEditing)
            .onChange(of: libraryItem) { _, item in
                guard let item else { return }
                Task {
                    if let data = try? await item.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        firstPhotoData = ImageProcessor.processedData(from: image)
                    }
                }
            }
            .fullScreenCover(isPresented: $showingCamera) {
                CameraPicker { image in
                    firstPhotoData = ImageProcessor.processedData(from: image)
                }
                .ignoresSafeArea()
            }
        }
    }

    @ViewBuilder
    private var firstPhotoSection: some View {
        if let data = firstPhotoData, let image = UIImage(data: data) {
            Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .frame(height: 180)
                .frame(maxWidth: .infinity)
                .clipShape(RoundedRectangle(cornerRadius: PlanterTheme.controlCornerRadius, style: .continuous))
            TextField("Photo note (e.g. freshly repotted)", text: $firstPhotoCaption)
            Button("Remove photo", role: .destructive) {
                firstPhotoData = nil
                libraryItem = nil
            }
        } else {
            if UIImagePickerController.isSourceTypeAvailable(.camera) {
                Button {
                    showingCamera = true
                } label: {
                    Label("Take photo", systemImage: "camera.fill")
                }
            }
            PhotosPicker(selection: $libraryItem, matching: .images) {
                Label("Choose from library", systemImage: "photo.on.rectangle")
            }
        }
    }

    private func populateIfEditing() {
        guard let plant else { return }
        name = plant.name
        species = plant.species
        location = plant.location
        careGoal = plant.careGoal
        reminderDays = plant.reminderDays
    }

    private func save() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        if let plant {
            plant.name = trimmedName
            plant.species = species.trimmingCharacters(in: .whitespaces)
            plant.location = location.trimmingCharacters(in: .whitespaces)
            plant.careGoal = careGoal.trimmingCharacters(in: .whitespaces)
            plant.reminderDays = reminderDays
            plant.touch()
            ReminderScheduler.reschedule(for: plant)
        } else {
            let newPlant = Plant(
                name: trimmedName,
                species: species.trimmingCharacters(in: .whitespaces),
                location: location.trimmingCharacters(in: .whitespaces),
                careGoal: careGoal.trimmingCharacters(in: .whitespaces),
                reminderDays: reminderDays
            )
            modelContext.insert(newPlant)
            if let firstPhotoData {
                let photo = PlantPhoto(imageData: firstPhotoData, caption: firstPhotoCaption)
                photo.plant = newPlant
                modelContext.insert(photo)
            }
            if reminderDays != nil {
                ReminderScheduler.requestPermissionThenSchedule(for: newPlant)
            }
        }
        dismiss()
    }
}
