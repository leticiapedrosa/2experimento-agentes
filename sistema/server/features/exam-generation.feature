Feature: Exam Generation
  Generating an exam must assign power-of-2 scores to alternatives based on their order,
  and compute the Question Value as the sum of scores for the correct alternatives.

  Background:
    Given the system is ready to manage questions

  Scenario: Generate an exam with correct power-of-2 scores and question value
    Given a question exists with description "Power of 2 scoring" and the following alternatives:
      | description | isCorrect |
      | A1          | true      |
      | A2          | false     |
      | A3          | true      |
      | A4          | false     |
    When I generate an exam selecting the question with description "Power of 2 scoring"
    Then the generated exam should include the question with description "Power of 2 scoring"
    And that generated question should have alternative scores based on order:
      | description | score |
      | A1          | 1     |
      | A2          | 2     |
      | A3          | 4     |
      | A4          | 8     |
    And the generated question value should be 5

