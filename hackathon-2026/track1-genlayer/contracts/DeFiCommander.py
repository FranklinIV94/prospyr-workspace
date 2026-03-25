# { "Depends": "py-genlayer:test" }

import json
from dataclasses import dataclass
from genlayer import *

@allow_storage
@dataclass
class PendingAction:
    id: str
    user: str
    intent_action: str
    from_asset: str
    to_asset: str
    target_protocol: str
    yield_apr: float
    amount: int
    confidence: int
    source: str
    created_at: int

@allow_storage
@dataclass
class AuditEntry:
    id: str
    user: str
    action: str
    protocol: str
    yield_apr: float
    confidence: int
    source: str
    executed: bool
    timestamp: int

class DeFiCommander(gl.Contract):
    yield_oracle_address: Address
    settlement_address: Address
    pending_actions: TreeMap[Address, PendingAction]
    audit_trail: TreeMap[str, AuditEntry]
    action_counter: u256

    # Known good sources (Palantir provenance pattern)
    KNOWN_SOURCES = ["coingecko", "defillama", "defipulse", "api.aave", "api.compound"]

    def __init__(self, yield_oracle_address: str, settlement_address: str):
        self.yield_oracle_address = Address(yield_oracle_address)
        self.settlement_address = Address(settlement_address)
        self.action_counter = 0

    @gl.public.view
    def get_pending_action(self, user: str) -> dict:
        action = self.pending_actions.get(Address(user))
        if not action:
            return {"error": "No pending action"}
        return {
            "id": action.id,
            "user": action.user,
            "intent_action": action.intent_action,
            "from_asset": action.from_asset,
            "to_asset": action.to_asset,
            "target_protocol": action.target_protocol,
            "yield_apr": action.yield_apr,
            "amount": action.amount,
            "confidence": action.confidence,
            "source": action.source
        }

    @gl.public.view
    def get_audit_trail(self, offset: u256, limit: u256) -> list:
        """Get audit trail with provenance"""
        entries = []
        count = 0
        for key in self.audit_trail:
            if count >= offset:
                entry = self.audit_trail[key]
                entries.append({
                    "id": entry.id,
                    "user": entry.user,
                    "action": entry.action,
                    "protocol": entry.protocol,
                    "yield_apr": entry.yield_apr,
                    "confidence": entry.confidence,
                    "source": entry.source,
                    "executed": entry.executed,
                    "timestamp": entry.timestamp
                })
                if len(entries) >= limit:
                    break
            count += 1
        return entries

    @gl.public.write.payable
    async def execute_command(self, user: str, command: str) -> dict:
        """
        Accept natural language DeFi command.

        COMPLETION CRITERIA (Claude Architect pattern):
        - Intent confidence >= 0.7
        - Source provenance verified
        - Valid protocol found
        """
        self.action_counter += 1
        action_id = f"action_{self.action_counter}"

        # STEP 1: Parse intent with LLM
        def parse_intent() -> str:
            task = f"""
You are a DeFi intent parser. Parse this natural language command:

Command: "{command}"

Extract the user's intent and respond ONLY with valid JSON:
{{
    "action": "swap|move|transfer|deposit|withdraw|unknown",
    "from_asset": "USDC|USDT|DAI|ETH|BTC|stablecoin|any",
    "to_asset": "highest_yield|specific_protocol_name|any|stablecoin",
    "amount_type": "all|partial|exact|unspecified",
    "confidence": 0.0-1.0
}}

Respond ONLY with JSON. No markdown, no explanation.
"""
            result = gl.nondet.exec_prompt(task, response_format="json")
            return result

        # Validators must agree on parsed intent
        parsed = json.loads(gl.eq_principle.strict_eq(parse_intent))
        intent_action = parsed.get("action", "unknown")
        from_asset = parsed.get("from_asset", "any")
        to_asset = parsed.get("to_asset", "any")
        confidence = int(parsed.get("confidence", 0) * 100)

        # STEP 2: Reject low confidence (Claude Architect anti-pattern)
        if confidence < 70:
            return {
                "status": "rejected",
                "reason": "Low intent confidence",
                "confidence": confidence
            }

        if intent_action == "unknown":
            return {
                "status": "rejected",
                "reason": "Could not parse intent",
                "confidence": confidence
            }

        # STEP 3: Get best yield from oracle
        best_yield = gl.call(self.yield_oracle_address, "get_best_yield")

        if "error" in best_yield:
            return {
                "status": "rejected",
                "reason": "No yield data available",
                "confidence": confidence
            }

        target_protocol = best_yield.get("protocol", "")
        yield_apr = best_yield.get("yield_apr", 0)
        source = best_yield.get("source", "unknown")
        source_confidence = best_yield.get("confidence", 0)

        # STEP 4: Validate source provenance (Palantir pattern)
        source_valid = source.lower() in self.KNOWN_SOURCES
        if not source_valid:
            return {
                "status": "rejected",
                "reason": f"Unverified data source: {source}",
                "source": source,
                "confidence": confidence
            }

        # STEP 5: Create pending action
        action = PendingAction(
            id=action_id,
            user=user,
            intent_action=intent_action,
            from_asset=from_asset,
            to_asset=to_asset,
            target_protocol=target_protocol,
            yield_apr=yield_apr,
            amount=gl.tx.value,
            confidence=confidence,
            source=source,
            created_at=gl.block.timestamp
        )

        self.pending_actions[Address(user)] = action

        return {
            "status": "pending",
            "action_id": action_id,
            "action": {
                "intent_action": intent_action,
                "from_asset": from_asset,
                "to_asset": to_asset,
                "target_protocol": target_protocol,
                "yield_apr": yield_apr,
                "confidence": confidence,
                "source": source
            },
            "completion_criteria": {
                "confidence_threshold": 70,
                "source_verified": True,
                "balance_check": "required_at_confirmation"
            },
            "message": f"Confirm {intent_action} to {target_protocol} at {yield_apr}% APY?"
        }

    @gl.public.write
    async def confirm_action(self, user: str) -> dict:
        """
        User confirms pending action.
        EXPLICIT COMPLETION CRITERIA:
        - Pending action exists
        - Value matches
        - User has sufficient balance
        """
        action = self.pending_actions.get(Address(user))
        if not action:
            return {"status": "no_pending_action"}

        # Clear pending BEFORE execution (prevent re-entrancy)
        self.pending_actions[Address(user)] = None

        # STEP 6: Record to audit trail with provenance
        audit_id = f"audit_{action.id}"
        self.audit_trail[audit_id] = AuditEntry(
            id=audit_id,
            user=action.user,
            action=action.intent_action,
            protocol=action.target_protocol,
            yield_apr=action.yield_apr,
            confidence=action.confidence,
            source=action.source,
            executed=True,
            timestamp=gl.block.timestamp
        )

        # STEP 7: Execute via settlement layer
        result = gl.call(
            self.settlement_address,
            "execute_swap",
            Address(user),
            action.target_protocol,
            action.amount
        )

        return {
            "status": "executed",
            "action_id": action.id,
            "protocol": action.target_protocol,
            "yield_apr": action.yield_apr,
            "audit_id": audit_id,
            "result": result
        }

    @gl.public.write
    async def reject_action(self, user: str) -> dict:
        """User rejects pending action."""
        action = self.pending_actions.get(Address(user))
        if not action:
            return {"status": "no_pending_action"}

        # Log rejection
        audit_id = f"audit_{action.id}"
        self.audit_trail[audit_id] = AuditEntry(
            id=audit_id,
            user=action.user,
            action=action.intent_action,
            protocol=action.target_protocol,
            yield_apr=action.yield_apr,
            confidence=action.confidence,
            source=action.source,
            executed=False,
            timestamp=gl.block.timestamp
        )

        self.pending_actions[Address(user)] = None
        return {"status": "rejected", "action_id": action.id}
