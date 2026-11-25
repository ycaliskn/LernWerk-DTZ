package de.lernwerk.dtz;

import java.time.Instant;
import java.util.List;

/** Dependency-free self test; run with java -ea after compilation. */
public final class LearningRulesSelfTest {
    public static void main(String[] args) {
        assert LearningRules.levelsIncluded("A1").equals(List.of("A1"));
        assert LearningRules.levelsIncluded("A2").equals(List.of("A1", "A2"));
        assert LearningRules.levelsIncluded("B1").equals(List.of("A1", "A2", "B1"));

        Instant t0 = Instant.parse("2026-01-01T00:00:00Z");
        var first = LearningRules.recordReview(List.of(), true, t0);
        assert first.counted() && !first.mastered() && first.successfulReviewTimes().size() == 1;
        var tooSoon = LearningRules.recordReview(first.successfulReviewTimes(), true, t0.plusSeconds(5 * 60));
        assert !tooSoon.counted() && tooSoon.successfulReviewTimes().size() == 1;
        var second = LearningRules.recordReview(first.successfulReviewTimes(), true, t0.plusSeconds(11 * 60));
        assert second.counted() && !second.mastered();
        var thirdTooSoon = LearningRules.recordReview(second.successfulReviewTimes(), true, t0.plusSeconds(12 * 60 * 60));
        assert !thirdTooSoon.counted();
        var third = LearningRules.recordReview(second.successfulReviewTimes(), true, t0.plusSeconds(25 * 60 * 60));
        assert third.counted() && third.mastered();
        var reset = LearningRules.recordReview(second.successfulReviewTimes(), false, t0.plusSeconds(26 * 60 * 60));
        assert reset.successfulReviewTimes().isEmpty();
        System.out.println("LearningRulesSelfTest: PASS");
    }
}
