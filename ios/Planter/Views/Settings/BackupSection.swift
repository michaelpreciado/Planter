import SwiftData
import SwiftUI
import UniformTypeIdentifiers
import UIKit

struct BackupSection: View {
    @Environment(\.modelContext) private var modelContext

    @State private var exportURL: URL?
    @State private var showingShareSheet = false
    @State private var showingImporter = false
    @State private var showingImportConfirmation = false
    @State private var pendingImportData: Data?
    @State private var feedback: String?
    @State private var errorMessage: String?

    var body: some View {
        Section {
            Button {
                prepareExport()
            } label: {
                Label("Export backup", systemImage: "square.and.arrow.up")
            }
            Button {
                showingImporter = true
            } label: {
                Label("Import backup", systemImage: "square.and.arrow.down")
            }
            if let feedback {
                Text(feedback)
                    .font(.caption)
                    .foregroundStyle(Color.planterFern)
            }
        } header: {
            Text("Backup")
        } footer: {
            Text("Backups are JSON files with your plants, photos, notes, and chat history. Keep one in the Files app or iCloud Drive — importing replaces what's on this device.")
        }
        .sheet(isPresented: $showingShareSheet) {
            if let exportURL {
                ShareSheet(url: exportURL)
            }
        }
        .fileImporter(
            isPresented: $showingImporter,
            allowedContentTypes: [.json],
            allowsMultipleSelection: false
        ) { result in
            handleImportSelection(result)
        }
        .confirmationDialog(
            "Replace everything on this device?",
            isPresented: $showingImportConfirmation,
            titleVisibility: .visible
        ) {
            Button("Import and replace", role: .destructive) {
                performImport()
            }
            Button("Cancel", role: .cancel) {
                pendingImportData = nil
            }
        } message: {
            Text("Importing replaces all current plants, photos, notes, and chat history with the backup's contents.")
        }
        .alert("Backup problem", isPresented: .init(
            get: { errorMessage != nil },
            set: { if !$0 { errorMessage = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage ?? "")
        }
    }

    private func prepareExport() {
        do {
            let data = try BackupService.exportData(context: modelContext)
            let url = FileManager.default.temporaryDirectory
                .appendingPathComponent(BackupService.suggestedFilename())
            try data.write(to: url, options: .atomic)
            exportURL = url
            showingShareSheet = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func handleImportSelection(_ result: Result<[URL], Error>) {
        guard case .success(let urls) = result, let url = urls.first else { return }
        let accessing = url.startAccessingSecurityScopedResource()
        defer {
            if accessing { url.stopAccessingSecurityScopedResource() }
        }
        do {
            pendingImportData = try Data(contentsOf: url)
            showingImportConfirmation = true
        } catch {
            errorMessage = "Couldn't read that file."
        }
    }

    private func performImport() {
        guard let data = pendingImportData else { return }
        pendingImportData = nil
        do {
            try BackupService.importData(data, context: modelContext)
            feedback = "Backup imported."
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

/// UIKit share sheet so the exported file can go to Files, AirDrop, etc.
private struct ShareSheet: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: [url], applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
