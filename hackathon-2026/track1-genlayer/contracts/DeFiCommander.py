# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

class DeFiCommander(gl.Contract):

    def __init__(self, yield_oracle_address, settlement_address):
        self.yield_oracle_address = yield_oracle_address
        self.settlement_address = settlement_address
        self.pending_actions = {}
        self.audit_trail = {}
        self.action_counter = 0

    @gl.public.view
    def get_pending_action(self, user):
        action = self.pending_actions.get(user)
        if not action:
            return '{"error": "No pending action"}'
        return action

    @gl.public.view
    def get_audit_trail(self, offset_str, limit_str):
        offset = int(offset_str)
        limit = int(limit_str)
        
        import json
        keys = list(self.audit_trail.keys())
        start = min(offset, len(keys))
        end = min(offset + limit, len(keys))
        
        result = []
        for i in range(start, end):
            result.append(self.audit_trail[keys[i]])
        return json.dumps(result)

    @gl.public.write
    async def execute_command(self, user, command):
        import json
        
        self.action_counter += 1
        action_id = f"action_{self.action_counter}"

        # Get best yield from oracle
        best_yield = gl.call(self.yield_oracle_address, "get_best_yield")
        
        if "error" in best_yield:
            return json.dumps({
                "status": "rejected",
                "reason": "No yield data available"
            })

        # Parse yield data from JSON response
        try:
            yield_data = json.loads(best_yield)
        except:
            return json.dumps({
                "status": "rejected",
                "reason": "Invalid yield data"
            })

        # Create pending action
        action = {
            "id": action_id,
            "user": user,
            "command": command,
            "protocol": yield_data.get("protocol", ""),
            "yield_apr": yield_data.get("yield_apr", "0"),
            "source": yield_data.get("source", "unknown"),
            "created_at": gl.block.timestamp
        }

        self.pending_actions[user] = json.dumps(action)

        return json.dumps({
            "status": "pending",
            "action_id": action_id,
            "protocol": action["protocol"],
            "yield_apr": action["yield_apr"]
        })

    @gl.public.write
    async def confirm_action(self, user):
        import json
        
        action_json = self.pending_actions.get(user)
        if not action_json:
            return '{"status": "no_pending_action"}'

        action = json.loads(action_json)
        self.pending_actions[user] = ""

        # Record audit
        audit_entry = {
            "id": f"audit_{action['id']}",
            "user": user,
            "protocol": action["protocol"],
            "yield_apr": action["yield_apr"],
            "executed": True,
            "timestamp": gl.block.timestamp
        }
        self.audit_trail[audit_entry["id"]] = json.dumps(audit_entry)

        return json.dumps({
            "status": "executed",
            "action_id": action["id"],
            "protocol": action["protocol"]
        })

    @gl.public.write
    async def reject_action(self, user):
        import json
        
        action_json = self.pending_actions.get(user)
        if not action_json:
            return '{"status": "no_pending_action"}'

        action = json.loads(action_json)
        self.pending_actions[user] = ""

        return json.dumps({
            "status": "rejected",
            "action_id": action["id"]
        })
