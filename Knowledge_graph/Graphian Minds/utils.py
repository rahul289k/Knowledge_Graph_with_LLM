def nested_array_in_batch(arr_obj, batch_size):
    nested_arr = []
    arr_len = len(arr_obj)
    seek = 0
    remaining = arr_len
    while remaining > 0:
        nested_arr.append(arr_obj[seek:(seek + batch_size)])
        seek += batch_size
        remaining = arr_len - seek
    return nested_arr
