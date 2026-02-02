# coding: utf-8

import os
from huaweicloudsdkcore.auth.credentials import GlobalCredentials
from huaweicloudsdkbssintl.v2.region.bssintl_region import BssintlRegion
from huaweicloudsdkcore.exceptions import exceptions
from huaweicloudsdkbssintl.v2 import *

if __name__ == "__main__":
    # The AK and SK used for authentication are hard-coded or stored in plaintext, which has great security risks. It is recommended that the AK and SK be stored in ciphertext in configuration files or environment variables and decrypted during use to ensure security.
    # In this example, AK and SK are stored in environment variables for authentication. Before running this example, set environment variables CLOUD_SDK_AK and CLOUD_SDK_SK in the local environment
    ak = "HST3FYV320YL75ZJK7H6"
    sk = "AEx3D77PnqyP5hyU975DHvPjqfyVUxWxzCRCy8Aw"

    credentials = GlobalCredentials(ak, sk)

    client = BssintlClient.new_builder() \
        .with_credentials(credentials) \
        .with_region(BssintlRegion.value_of("sa-brazil-1")) \
        .build()

    try:
        request = ListOnDemandResourceRatingsRequest()
        request.body = RateOnDemandReq(
        )
        response = client.list_on_demand_resource_ratings(request)
        print(response)
    except exceptions.ClientRequestException as e:
        print(e.status_code)
        print(e.request_id)
        print(e.error_code)
        print(e.error_msg)