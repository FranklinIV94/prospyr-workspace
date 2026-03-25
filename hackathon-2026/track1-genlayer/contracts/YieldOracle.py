# { "Depends": "py-genlayer:test" }

import json
from dataclasses import dataclass
from genlayer import *

@allow_storage
@dataclass
class YieldRecord:
    protocol: str
    yield_apr: float
    source: str
    confidence: int
    updated_at: int

class YieldOracle(gl.Contract):
    yields: TreeMap[str, YieldRecord]
    last_full_update: int

    def __init__(self):
        self.last_full_update = 0

    @gl.public.view
    def get_yield(self, protocol: str) -> dict:
        record = self.yields.get(protocol)
        if not record:
            return {"error": "Protocol not found"}
        return {
            "protocol": record.protocol,
            "yield_apr": record.yield_apr,
            "source": record.source,
            "confidence": record.confidence
        }

    @gl.public.view
    def get_best_yield(self) -> dict:
        if not self.yields:
            return {"error": "No yield data"}

        best_protocol = None
        best_yield = 0.0
        best_record = None

        for key in self.yields:
            record = self.yields[key]
            if record.yield_apr > best_yield:
                best_yield = record.yield_apr
                best_protocol = key
                best_record = record

        if not best_record:
            return {"error": "No valid yields"}

        return {
            "protocol": best_protocol,
            "yield_apr": best_record.yield_apr,
            "source": best_record.source,
            "confidence": best_record.confidence
        }

    @gl.public.write
    def update_yield(self, protocol: str, yield_apr: float, source: str, confidence: int) -> None:
        # Validate inputs
        if yield_apr < 0 or yield_apr > 100:
            raise Exception("Yield APR out of reasonable bounds (0-100%)")

        if confidence < 0 or confidence > 100:
            raise Exception("Confidence must be 0-100")

        self.yields[protocol] = YieldRecord(
            protocol=protocol,
            yield_apr=yield_apr,
            source=source,
            confidence=confidence,
            updated_at=gl.block.timestamp
        )

    @gl.public.write
    async def fetch_yields_from_web(self, api_url: str) -> dict:
        """
        Fetch real-time yields from DeFi API.
        Non-deterministic: LLM parses natural language yield reports.
        Validators reach consensus via equivalence principle.
        """
        def fetch_and_parse() -> str:
            # Fetch web content
            web_data = gl.nondet.web.render(api_url, mode="text")

            # LLM extracts structured yield data
            task = f"""
Extract DeFi yield data from the following content.

Return ONLY valid JSON with this exact format:
{{
    "yields": [
        {{"protocol": "Aave", "yield_apr": 4.2, "source": "api.coingecko"}},
        {{"protocol": "Compound", "yield_apr": 3.8, "source": "api.coingecko"}}
    ]
}}

Content:
{web_data}

Respond ONLY with JSON. No markdown, no explanation.
"""
            result = gl.nondet.exec_prompt(task, response_format="json")
            return json.dumps(result)

        # Validators must agree on parsed yields
        result_json = json.loads(gl.eq_principle.strict_eq(fetch_and_parse))

        # Update stored yields
        for yield_data in result_json.get("yields", []):
            protocol = yield_data["protocol"]
            yield_apr = float(yield_data["yield_apr"])
            source = yield_data.get("source", api_url)
            confidence = yield_data.get("confidence", 75)

            self.yields[protocol] = YieldRecord(
                protocol=protocol,
                yield_apr=yield_apr,
                source=source,
                confidence=confidence,
                updated_at=gl.block.timestamp
            )

        self.last_full_update = gl.block.timestamp

        return {"status": "updated", "count": len(result_json.get("yields", []))}

    @gl.public.view
    def get_all_yields(self) -> dict:
        return {k: {
            "protocol": v.protocol,
            "yield_apr": v.yield_apr,
            "source": v.source,
            "confidence": v.confidence
        } for k, v in self.yields.items()}
