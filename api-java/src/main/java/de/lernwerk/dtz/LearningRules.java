package de.lernwerk.dtz;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Core learning rules. Kept free of framework dependencies for easy unit testing. */
public final class LearningRules {
    public static final Duration SECOND_REVIEW_GAP = Duration.ofMinutes(10);
    public static final Duration THIRD_REVIEW_GAP = Duration.ofHours(24);

    private LearningRules() {}

    public static List<String> levelsIncluded(String selectedLevel) {
        return switch (selectedLevel) {
            case "A1" -> List.of("A1");
            case "A2" -> List.of("A1", "A2");
            case "B1" -> List.of("A1", "A2", "B1");
            default -> throw new IllegalArgumentException("Unsupported level: " + selectedLevel);
        };
    }

    public static boolean isReviewDue(List<Instant> successfulReviewTimes, Instant now) {
        if (successfulReviewTimes.isEmpty()) return true;
        Instant last = successfulReviewTimes.get(successfulReviewTimes.size() - 1);
        Duration minimumGap = successfulReviewTimes.size() == 1
                ? SECOND_REVIEW_GAP
                : THIRD_REVIEW_GAP;
        return !now.isBefore(last.plus(minimumGap));
    }

    public static ReviewResult recordReview(List<Instant> successfulReviewTimes, boolean correct, Instant now) {
        List<Instant> updated = new ArrayList<>(successfulReviewTimes);
        if (!correct) {
            updated.clear();
            return new ReviewResult(updated, false, false);
        }
        if (!isReviewDue(updated, now)) {
            return new ReviewResult(updated, false, false);
        }
        updated.add(now);
        return new ReviewResult(updated, true, updated.size() >= 3);
    }

    public record ReviewResult(List<Instant> successfulReviewTimes, boolean counted, boolean mastered) {}
}
