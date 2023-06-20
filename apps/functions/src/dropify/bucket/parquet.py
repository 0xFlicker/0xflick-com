import boto3
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from io import StringIO, BytesIO
import json

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Get bucket name and file key from the event
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    file_key = event['Records'][0]['s3']['object']['key']
    
    # Get the file object
    file_obj = s3.get_object(Bucket=bucket_name, Key=file_key)
    
    # Read the file content
    file_content = file_obj["Body"].read().decode('utf-8')
    
    # Convert JSON content to Python dictionary
    data = json.loads(file_content)
    
    # Convert data to Pandas DataFrame
    df = pd.json_normalize(data)
    
    # Define Parquet schema
    parquet_schema = pa.schema([
        ("string_value", pa.utf8()),
        ("numeric_value", pa.float64()),
        ("trait_type", pa.utf8()),
        ("display_type", pa.utf8()),
        ("colors", pa.list_(pa.utf8())),
        ("tokenId", pa.utf8()),
        ("contractAddress", pa.utf8())
    ])

    # Convert DataFrame to Apache Arrow Table
    table = pa.Table.from_pandas(df, schema=parquet_schema, preserve_index=False)
    
    # Convert Arrow Table to Parquet
    output_stream = BytesIO()
    pq.write_table(table, output_stream)
    
    # Prepare to write to S3
    output_stream.seek(0)
    
    # Define the output file key
    output_key = file_key.rsplit('.', 1)[0] + '.parquet'
    
    # Write Parquet data to S3
    s3.put_object(Body=output_stream.getvalue(), Bucket=bucket_name, Key=output_key)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Successfully converted JSON to Parquet and saved to S3.')
    }
