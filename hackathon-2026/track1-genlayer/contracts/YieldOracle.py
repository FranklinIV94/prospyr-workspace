# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

class YieldOracle(gl.Contract):

    def __init__(self):
        self.last_full_update = 0
        self.yields = {}

    @gl.public.view
    def get_yield(self, protocol):
        record = self.yields.get(protocol)
        if not record:
            return '{"error": "Protocol not found"}'
        return record

    @gl.public.view
    def get_best_yield(self):
        if not self.yields:
            return '{"error": "No yield data"}'

        best_protocol = ""
        best_yield = "0"
        best_record = ""

        for key in self.yields:
            record = self.yields[key]
            parts = record.split("|")
            if len(parts) >= 2:
                yield_val = float(parts[1])
                if yield_val > float(best_yield):
                    best_yield = parts[1]
                    best_protocol = key
                    best_record = record

        if not best_record:
            return '{"error": "No valid yields"}'

        return best_record

    @gl.public.write
    def update_yield(self, protocol, yield_apr_str, source, confidence_str):
        yield_apr = float(yield_apr_str)
        confidence = int(confidence_str)

        if yield_apr < 0 or yield_apr > 100:
            raise Exception("Yield APR out of reasonable bounds (0-100%)")
        if confidence < 0 or confidence > 100:
            raise Exception("Confidence must be 0-100")

        record = f"{protocol}|{yield_apr}|{source}|{confidence}|{gl.block.timestamp}"
        self.yields[protocol] = record

    @gl.public.view
    def get_all_yields(self):
        import json
        return json.dumps(self.yields)
