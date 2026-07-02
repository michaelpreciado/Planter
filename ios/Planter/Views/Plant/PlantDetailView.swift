import SwiftData
import SwiftUI

struct PlantDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Environment(\.entitlements) private var entitlements
    @Environment(AppRouter.self) private var router

    @Bindable var plant: Plant

    @State private var newNote = ""
    @State private var showingAddPhoto = false
    @State private var showingEdit = false
    @State private var showingDeleteConfirmation = false

    private let reminderChoices: [(label: String, days: Int?)] = [
        ("None", nil),
        ("Every 2 days", 2),
        ("Every 4 days", 4),
        ("Weekly", 7),
        ("Every 2 weeks", 14),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                PlantHeroHeader(plant: plant)
                careControls
                GeometricDivider()
                if entitlements.isUnlocked(.photoCompare) {
                    compareSection
                }
                timelineSection
                notesSection
                askAssistantButton
            }
            .padding(PlanterTheme.screenPadding)
        }
        .background(Color.planterCream)
        .navigationTitle(plant.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button {
                        showingEdit = true
                    } label: {
                        Label("Edit plant", systemImage: "pencil")
                    }
                    Button(role: .destructive) {
                        showingDeleteConfirmation = true
                    } label: {
                        Label("Delete plant", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showingEdit) {
            AddEditPlantView(plant: plant)
        }
        .sheet(isPresented: $showingAddPhoto) {
            AddPhotoSheet(plant: plant)
        }
        .confirmationDialog(
            "Delete \(plant.name)?",
            isPresented: $showingDeleteConfirmation,
            titleVisibility: .visible
        ) {
            Button("Delete plant and its photos", role: .destructive) {
                deletePlant()
            }
        } message: {
            Text("This removes the plant, its photos, and its notes from this device. This can't be undone.")
        }
    }

    // MARK: - Sections

    private var careControls: some View {
        VStack(alignment: .leading, spacing: 12) {
            EyebrowText("Care")
            Picker("Status", selection: statusBinding) {
                ForEach(PlantStatus.allCases) { status in
                    Text(status.label).tag(status)
                }
            }
            .pickerStyle(.segmented)

            HStack(spacing: 10) {
                Button {
                    plant.isImportant.toggle()
                    plant.touch()
                } label: {
                    Label("Important", systemImage: plant.isImportant ? "bell.fill" : "bell")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(plant.isImportant ? Color.planterPaper : Color.planterTerra)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(Capsule().fill(plant.isImportant ? Color.planterTerra : Color.planterTerra.opacity(0.14)))
                }
                Button {
                    markCaredFor()
                } label: {
                    Label("Mark cared for", systemImage: "checkmark")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Color.planterPaper)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(Capsule().fill(Color.planterMoss))
                }
            }

            if !plant.careGoal.isEmpty {
                Text(plant.careGoal)
                    .font(.subheadline)
                    .foregroundStyle(Color.planterInk.opacity(0.7))
            }

            Picker("Care reminder", selection: reminderBinding) {
                ForEach(reminderChoices, id: \.days) { choice in
                    Text(choice.label).tag(choice.days)
                }
            }
            .pickerStyle(.menu)
            .tint(Color.planterMoss)
        }
        .planterCard()
    }

    @ViewBuilder
    private var compareSection: some View {
        let photos = plant.sortedPhotos
        if photos.count >= 2 {
            VStack(alignment: .leading, spacing: 12) {
                EyebrowText("Photo comparison")
                PhotoCompareView(beforeData: photos[1].imageData, afterData: photos[0].imageData)
            }
            .planterCard()
        }
    }

    private var timelineSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                EyebrowText("Progress timeline")
                Spacer()
                Button {
                    showingAddPhoto = true
                } label: {
                    Label("Add photo", systemImage: "camera.fill")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Color.planterPaper)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(Capsule().fill(Color.planterMoss))
                }
            }
            if plant.photos.isEmpty {
                Text("No photos yet. Take one from the same angle every week or two and the timeline builds itself.")
                    .font(.subheadline)
                    .foregroundStyle(Color.planterInk.opacity(0.6))
            } else {
                PhotoTimelineView(plant: plant) { photo in
                    modelContext.delete(photo)
                    plant.touch()
                }
            }
        }
        .planterCard()
    }

    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            EyebrowText("Care notes")
            HStack(spacing: 8) {
                TextField("Add an observation…", text: $newNote)
                    .textFieldStyle(.roundedBorder)
                Button {
                    addNote()
                } label: {
                    Image(systemName: "checkmark")
                        .font(.body.weight(.bold))
                        .foregroundStyle(Color.planterPaper)
                        .padding(10)
                        .background(Circle().fill(Color.planterMoss))
                }
                .disabled(newNote.trimmingCharacters(in: .whitespaces).isEmpty)
                .accessibilityLabel("Save note")
            }
            ForEach(plant.sortedNotes) { note in
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(note.text)
                            .font(.subheadline)
                            .foregroundStyle(Color.planterInk.opacity(0.8))
                        Text(note.createdAt, format: .relative(presentation: .named))
                            .font(.caption2)
                            .foregroundStyle(Color.planterInk.opacity(0.45))
                    }
                    Spacer(minLength: 0)
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: PlanterTheme.controlCornerRadius, style: .continuous)
                        .fill(Color.planterSage.opacity(0.14))
                )
                .contextMenu {
                    Button(role: .destructive) {
                        modelContext.delete(note)
                        plant.touch()
                    } label: {
                        Label("Delete note", systemImage: "trash")
                    }
                }
            }
        }
        .planterCard()
    }

    private var askAssistantButton: some View {
        Button {
            router.openChat(scopedTo: plant.id)
        } label: {
            Label("Ask the assistant about \(plant.name)", systemImage: "bubble.left.and.text.bubble.right.fill")
                .font(.subheadline.weight(.bold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Capsule().fill(Color.planterSun.opacity(0.3)))
                .foregroundStyle(Color.planterEarth)
        }
    }

    // MARK: - Actions

    private var statusBinding: Binding<PlantStatus> {
        Binding(
            get: { plant.status },
            set: { newValue in
                plant.status = newValue
                plant.touch()
            }
        )
    }

    private var reminderBinding: Binding<Int?> {
        Binding(
            get: { plant.reminderDays },
            set: { newValue in
                let hadReminder = plant.reminderDays != nil
                plant.reminderDays = newValue
                plant.touch()
                if newValue != nil, !hadReminder {
                    ReminderScheduler.requestPermissionThenSchedule(for: plant)
                } else {
                    ReminderScheduler.reschedule(for: plant)
                }
            }
        )
    }

    private func markCaredFor() {
        plant.lastCaredAt = .now
        if plant.status == .urgent {
            plant.status = .watch
        }
        plant.touch()
        ReminderScheduler.reschedule(for: plant)
    }

    private func addNote() {
        let text = newNote.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        let note = CareNote(text: text)
        note.plant = plant
        modelContext.insert(note)
        plant.touch()
        newNote = ""
    }

    private func deletePlant() {
        ReminderScheduler.cancel(for: plant)
        modelContext.delete(plant)
        dismiss()
    }
}
