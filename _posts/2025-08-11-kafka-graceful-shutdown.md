---
layout: post
title: "[DevOps] Kafka graceful shutdown 구현하기"
subtitle: "[DevOps] kafka graceful shutdown하기"
categories: programming
tags: devops
comments: true
---

```python
class KafkaConsumer:
    def __init__(self, loop: asyncio.AbstractEventLoop, group_id: str):
        self.stop_event = asyncio.Event()
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, self.stop_event.set)

        ssl_context = create_ssl_context()
        self.consumer = AIOKafkaConsumer(
            topics[task],
            group_id=group_id,
            bootstrap_servers=config.kafka_server,
            value_deserializer=lambda x: json.loads(x),
            security_protocol="SASL_SSL",
            ssl_context=ssl_context,
            sasl_mechanism="SCRAM-SHA-512",
            sasl_plain_username=config.kafka_username,
            sasl_plain_password=config.kafka_password,
            request_timeout_ms=60000,
            session_timeout_ms=60000,
            max_poll_records=10,
            enable_auto_commit=False,
            loop=loop,
        )

    async def start(self):
        await self.consumer.start()

    async def stop(self):
        await self.consumer.stop()

    async def consume(self):
        async for msg in self.consumer:
            if self.stop_event.is_set():
                log_warning(f"signal received, stopping consumer for task: {task}")
                break

            request_id = None
            try:
                # parse message
                kafka_message = KafkaMessage()
                kafka_message.from_dict(msg.value)
                request_id = kafka_message.req_id
                request_id_context.set(request_id)
                payload = kafka_message.get_payload()
                if payload.task != task:
                    continue

                # process message
                log_info(f"Consumed message: {msg.value}")
                await update_status_processing(request_id)
                await self._process_message(kafka_message)

            except Exception as e:
                log_error(str(e))
                log_error(traceback.format_exc())
                if request_id:
                    await update_status_error(request_id, str(e))

            finally:
                await self.consumer.commit()
```
