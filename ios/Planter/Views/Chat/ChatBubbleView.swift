import SwiftUI

struct ChatBubbleView: View {
    let content: String
    let isUser: Bool

    var body: some View {
        HStack {
            if isUser { Spacer(minLength: 40) }
            Text(content)
                .font(.subheadline)
                .foregroundStyle(isUser ? Color.planterPaper : Color.planterInk)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(isUser ? Color.planterMoss : Color.planterSage.opacity(0.22))
                )
            if !isUser { Spacer(minLength: 40) }
        }
    }
}
