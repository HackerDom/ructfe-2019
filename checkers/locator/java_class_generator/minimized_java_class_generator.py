pack = lambda a, b: [b] if a == "b" else [b // 256, b % 256]


def make_class(field_names):
    constant_pool = [None, ("a", (3, 13)), ("b", 14),
                     ("b", 15), ("c", ('<init>', 4)),
                     ("c", ('()V', 5)), ("c", ('Code', 6)),
                     ("c", ('', 7)), ("c", ('', 8)),
                     ("c", ('this', 9)), ("c", ('LB;', 10)),
                     ("c", ('', 11)), ("c", ('', 12)),
                     ("d", (4, 5)), ("c", ('B', 14)),
                     ("c", ('java/lang/Object', 15))]
    fields = []

    for field_name in field_names:
        constant_pool.append(("c", (field_name, len(constant_pool) - 1)))

    constant_pool.append(("c", ("Ljava/lang/String;", len(constant_pool) - 1)))

    for i in range(len(field_names)):
        fields.append((1, len(constant_pool) - 2 - i, len(constant_pool) - 1))

    buffer = []
    constant_pool_count = len(constant_pool)
    field_count = len(fields)

    buffer.append([202, 254, 186, 190, 0, 0, 0, 52])

    buffer.append(pack("", constant_pool_count))
    for constant in constant_pool[1:]:
        if constant[0] == "c":
            buffer.append(pack("b", 1))
            buffer.append(pack("", len(constant[1][0])))
            buffer.append(constant[1][0].encode())
        elif constant[0] == "b":
            buffer.append(pack("b", 7))
            buffer.append(pack("", constant[1]))
        elif constant[0] == "d":
            buffer.append(pack("b", 12))
            buffer.append(pack("", constant[1][0]))
            buffer.append(pack("", constant[1][1]))
        elif constant[0] == "a":
            buffer.append(pack("b", 10))
            buffer.append(pack("", constant[1][0]))
            buffer.append(pack("", constant[1][1]))

    buffer.append([0, 33, 0, 2, 0, 3, 0, 0])

    buffer.append(pack("", field_count))
    for field in fields:
        buffer.append(pack("", field[0]))
        buffer.append(pack("", field[1]))
        buffer.append(pack("", field[2]))
        buffer.append(pack("", 0))

    buffer.append([0, 1, 0, 1, 0, 4, 0, 5, 0, 1, 0, 6, 0, 0, 0, 47, 0, 1, 0, 1, 0, 0, 0, 5, 42, 183, 0, 1, 177, 0, 0, 0, 2, 0, 7, 0, 0, 0, 6, 0, 1, 0, 0, 0, 3, 0, 8, 0, 0, 0, 12, 0, 1, 0, 0, 0, 5, 0, 9, 0, 10, 0, 0, 0, 1, 0, 11, 0, 0, 0, 2, 0, 12])

    res = []
    for line in buffer:
        res.extend(line)
    return res
