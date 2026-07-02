import PhotosUI
import SwiftData
import SwiftUI
import UIKit

struct AddPhotoSheet: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    let plant: Plant

    @State private var photoData: Data?
    @State private var caption = ""
    @State private var libraryItem: PhotosPickerItem?
    @State private var showingCamera = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    if let data = photoData, let image = UIImage(data: data) {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFill()
                            .frame(height: 240)
                            .frame(maxWidth: .infinity)
                            .clipShape(RoundedRectangle(cornerRadius: PlanterTheme.controlCornerRadius, style: .continuous))
                        Button("Choose a different photo", role: .destructive) {
                            photoData = nil
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
                Section("Note") {
                    TextField("What changed in this photo?", text: $caption, axis: .vertical)
                        .lineLimit(2...4)
                }
            }
            .scrollContentBackground(.hidden)
            .background(Color.planterCream)
            .navigationTitle("New progress photo")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(photoData == nil)
                }
            }
            .onChange(of: libraryItem) { _, item in
                guard let item else { return }
                Task {
                    if let data = try? await item.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        photoData = ImageProcessor.processedData(from: image)
                    }
                }
            }
            .fullScreenCover(isPresented: $showingCamera) {
                CameraPicker { image in
                    photoData = ImageProcessor.processedData(from: image)
                }
                .ignoresSafeArea()
            }
        }
    }

    private func save() {
        guard let photoData else { return }
        let photo = PlantPhoto(imageData: photoData, caption: caption.trimmingCharacters(in: .whitespaces))
        photo.plant = plant
        modelContext.insert(photo)
        plant.touch()
        dismiss()
    }
}
