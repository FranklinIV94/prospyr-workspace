# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

class BaseSettlementLayer(gl.Contract):

    def __init__(self):
        self.balances = {}
        self.provenance_log = {}

    @gl.public.view
    def get_balance(self, user):
        return self.balances.get(user, 0)

    @gl.public.write
    def deposit(self):
        sender = str(gl.tx.sender)
        current = self.balances.get(sender, 0)
        self.balances[sender] = current + gl.tx.value

    @gl.public.write
    def execute_swap(self, user, target_protocol, amount_str):
        amount = int(amount_str)
        user_addr = str(user)
        
        current_balance = self.balances.get(user_addr, 0)
        if current_balance < amount:
            return '{"error": "Insufficient balance"}'

        self.balances[user_addr] = current_balance - amount
        
        import json
        result = {
            "status": "executed",
            "user": user,
            "protocol": target_protocol,
            "amount": amount
        }
        return json.dumps(result)

    @gl.public.write
    def record_provenance(self, protocol, source, confidence_str):
        confidence = int(confidence_str)
        if confidence < 60:
            raise Exception("Confidence too low")
        
        import json
        record = json.dumps({
            "source": source,
            "timestamp": gl.block.timestamp,
            "confidence": confidence,
            "verified": True
        })
        self.provenance_log[protocol] = record

    @gl.public.view
    def get_provenance(self, protocol):
        record = self.provenance_log.get(protocol)
        if not record:
            return '{"error": "No provenance record"}'
        return record
