class SemanticSequenceEngine:
    """
    Matches ordered AST event sequences (Semgrep pattern-seq equivalent).
    """

    def analyze(self, ast_events, rule):
        sequence = rule.get("sequence")
        if not sequence:
            return []

        matches = []
        seq_len = len(sequence)

        for i in range(len(ast_events) - seq_len + 1):
            window = ast_events[i:i + seq_len]
            if all(self._match(p, n) for p, n in zip(sequence, window)):
                matches.append(window[-1])

        return matches

    def _match(self, pattern, node):
        for key, value in pattern.items():
            if node.get(key) != value:
                return False
        return True
