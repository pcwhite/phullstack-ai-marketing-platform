import os
from models import AssetProcessingJob
from config import config
import asyncio
from api_client import (
    fetch_asset,
    fetch_asset_file,
    update_job_heartbeat,
    update_job_details,
    update_asset_content,
)
from media_processor import split_audio_file, extract_audio_and_split, transcribe_chunks
from logger import logger


async def process_job(job: AssetProcessingJob) -> None:
    logger.info(f"Processing job {job.id}")

    heartbeat_task = asyncio.create_task(heartbeat(job.id))

    try:
        await update_job_details(job.id, {"status": "in_progress"})

        # TODO: Fetch asset associated with asset processing job
        asset = await fetch_asset(job.assetId)
        if asset is None:
            raise ValueError(f"Asset not found for asset processing job {job.id}")

        file_buffer = await fetch_asset_file(asset.fileUrl)

        content_type = asset.fileType
        content = file_buffer

        if content_type in ["text", "markdown"]:
            logger.info(f"Processing text/markdown file for job {asset.fileName}")
            content = file_buffer.decode("utf-8")
        elif content_type == "audio":
            logger.info(f"Processing audio file...")
            chunks = await split_audio_file(
                file_buffer,
                config.MAX_CHUNK_SIZE_BYTES,
                os.path.basename(asset.fileName),
            )
            transcribed_chunks = await transcribe_chunks(chunks)
            content = "\n\n".join(transcribed_chunks)
        elif content_type == "video":
            logger.info(f"Processing video file...")
            chunks = await extract_audio_and_split(
                file_buffer,
                config.MAX_CHUNK_SIZE_BYTES,
                os.path.basename(asset.fileName),
            )
            transcribed_chunks = await transcribe_chunks(chunks)
            content = "\n\n".join(transcribed_chunks)
        else:
            raise ValueError(f"Unsupported content type: {content_type}")

        # Update job content
        await update_asset_content(asset.id, content)

        #  Update job status to completed
        await update_job_details(job.id, {"status": "completed"})

    except Exception as e:
        logger.error(f"Error updating job status to in_progress for job {job.id}: {e}")
        error_message = str(e)
        await update_job_details(
            job.id,
            {
                "status": "failed",
                "errorMessage": error_message,
                "attempts": job.attempts + 1,
            },
        )

    finally:
        heartbeat_task.cancel()
        try:
            await heartbeat_task
        except asyncio.CancelledError:
            pass


async def heartbeat(job_id: str) -> None:
    while True:
        try:
            await update_job_heartbeat(job_id)
            await asyncio.sleep(config.HEARTBEAT_INTERVAL_SECONDS)
        except asyncio.CancelledError:
            logger.info(f"Heartbeat for job {job_id} cancelled")
            break
        except Exception as e:
            logger.error(f"Error updating job heartbeat for job {job_id}: {e}")
            await asyncio.sleep(config.HEARTBEAT_INTERVAL_SECONDS)
