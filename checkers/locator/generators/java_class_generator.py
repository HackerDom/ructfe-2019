import io
import struct
from dataclasses import dataclass
from enum import Enum
from typing import List


class ConstantType(Enum):
    STRING = "string"
    CLASS_REF = "class_ref"
    NAME_AND_TYPE = "name_and_type"
    METHOD_REF = "method_ref"


@dataclass
class Constant:
    type: ConstantType
    value: object


@dataclass
class String:
    value: str
    number: int


@dataclass
class ClassRef:
    number: int
    # value: str


@dataclass
class NameAndType:
    # name: str
    # typ: str
    name_number: int
    typ_number: int


@dataclass
class MethodRef:
    # class_ref: str
    # nat_desc: str
    class_ref_number: int
    nat_desc_number: int


@dataclass
class Field:
    access_flags: int
    name: int
    descriptor: int
    attributes: list


@dataclass
class Method:
    access_flags: int
    name: int
    descriptor: int
    attributes: list


@dataclass
class Attribute:
    name: int
    length: int
    info: list


@dataclass
class ThisClass:
    value: Constant
    number: int


@dataclass
class SuperClass:
    value: Constant
    number: int


@dataclass
class Class:
    magic: bytes
    minor_version: bytes
    major_version: bytes
    constant_pool: List[Constant]
    access_flags: int
    this_class: Constant
    super_class: Constant
    fields: List[Field]
    methods: List[Method]
    attributes: List[Attribute]

    @staticmethod
    def with_defaults(
            constant_pool: List[Constant],
            this_class: Constant,
            super_class: Constant,
            fields: List[Field],
            methods: List[Method],
            attributes: List[Attribute]
    ):
        return Class(
            magic=b'\xca\xfe\xba\xbe',
            minor_version=b'\x00\x00',
            major_version=b'\x004',
            constant_pool=constant_pool,
            access_flags=33,
            this_class=this_class,
            super_class=super_class,
            fields=fields,
            methods=methods,
            attributes=attributes
        )


class ClassBuilder:
    def __init__(self, content):
        self.content = content
        self.offset = 0
        self.magic = None
        self.minor_version = None
        self.major_version = None
        self.constant_pool_count = None
        self.constant_pool = [None]
        self.access_flags = None
        self.this_class = None
        self.super_class = None
        self.interface_count = None
        self.field_count = None
        self.fields = []
        self.method_count = None
        self.methods = []
        self.attribute_count = None
        self.attributes = []

        self.read()

    def print(self, *args, **kwargs):
        # print(*args, **kwargs)
        pass

    def get(self, second_arg):
        if isinstance(second_arg, str):
            length = struct.calcsize(second_arg)
        elif isinstance(second_arg, int):
            length = second_arg
        else:
            raise Exception("Wrong argument type: " + type(second_arg))

        self.offset += length
        raw_content = self.content[self.offset - length:self.offset]
        if isinstance(second_arg, str):
            return struct.unpack(second_arg, raw_content)
        else:
            return raw_content

    def get_str_desc(self):
        for constant in self.constant_pool[1:]:
            if constant.type == ConstantType.STRING:
                if constant.value.value == "Ljava/lang/String;":
                    return constant.value.number

    def read_magic(self):
        self.magic = self.get(4)
        self.print("magic:", self.magic)

    def read_minor_version(self):
        self.minor_version = self.get(2)
        self.print("minor version:", self.minor_version)

    def read_major_version(self):
        self.major_version = self.get(2)
        self.print("major version:", self.major_version)

    def read_constant_pool_count(self):
        self.constant_pool_count, = self.get(">H")
        self.constant_pool_count -= 1
        self.print("constant pool count:", self.constant_pool_count)

    def add_str_constant(self, value: str):
        constant = Constant(ConstantType.STRING, String(value, len(self.constant_pool)))
        self.constant_pool.append(constant)

    def read_constant(self):
        tag, = self.get(">B")
        self.print("tag:", tag, end=', ')
        if tag == 1:  # string
            self.print('string')
            length, = self.get(">H")
            self.print("length:", length)
            s = self.get(length)
            self.print("string:", s.decode())
            self.add_str_constant(s.decode())

        elif tag == 7:
            self.print("class reference")
            number, = self.get(">H")
            self.print("number:", number)
            new_class_ref = Constant(
                ConstantType.CLASS_REF,
                ClassRef(
                    number,
                    # self.constant_pool[number].value
                )
            )
            self.constant_pool.append(new_class_ref)
        elif tag == 12:
            self.print("NameAndType")
            name, typ = self.get(">HH")
            self.print(f"name: {name}, type: {typ}")
            name_and_type_obj = NameAndType(
                # self.constant_pool[name].value,
                # self.constant_pool[typ].value,
                name,
                typ
            )
            name_and_type = Constant(ConstantType.NAME_AND_TYPE, name_and_type_obj)
            self.constant_pool.append(name_and_type)
        elif tag == 10:
            self.print("Method ref")
            cl_ref, nat_dec = self.get(">HH")
            self.print(f"Class ref: {cl_ref}, name and type desc: {nat_dec}")
            method_ref_obj = MethodRef(
                # self.constant_pool[cl_ref].value,
                # self.constant_pool[nat_dec].value,
                cl_ref,
                nat_dec
            )
            method_ref = Constant(ConstantType.METHOD_REF, method_ref_obj)
            self.constant_pool.append(method_ref)
        else:
            raise Exception(f"Unknown tag number: {tag}")

    def read_constant_pool(self):
        self.read_constant_pool_count()
        for i in range(self.constant_pool_count):
            self.print(i, end=": ")
            self.read_constant()

    def read_access_flags(self):
        self.access_flags, = self.get(">H")
        self.print("access flags:", self.access_flags)

    def read_this_class(self):
        this_class_number, = self.get(">H")
        self.this_class = ThisClass(self.constant_pool[this_class_number], this_class_number)
        self.print("this class:", self.this_class)

    def read_super_class(self):
        super_class_number, = self.get(">H")
        self.super_class = SuperClass(self.constant_pool[super_class_number], super_class_number)
        self.print("super class:", self.super_class)

    def read_interface_count(self):
        interface_count, = self.get(">H")
        self.print("interface count:", interface_count)
        self.interface_count = interface_count

    def read_interfaces(self):
        self.read_interface_count()
        if self.interface_count:
            raise Exception("Interfaces are unsupported")

    def read_field_count(self):
        self.field_count, = self.get(">H")
        self.print("field count:", self.field_count)

    def read_field(self):
        access_flags, name_index, descriptor_index, attributes_count = self.get(">HHHH")
        if attributes_count:
            raise Exception("Attributes count must be zero")
        field = Field(access_flags, name_index, descriptor_index, [])
        self.fields.append(field)
        self.print("new field:", field)

    def read_fields(self):
        self.read_field_count()
        for i in range(self.field_count):
            self.read_field()

    def add_field(self, name):
        self.add_str_constant(name)
        self.fields.append(Field(1, len(self.constant_pool) - 1, self.get_str_desc(), []))

    def read_method_count(self):
        self.method_count, = self.get(">H")
        self.print("method count:", self.method_count)

    def read_attribute(self):
        name_index, length = self.get(">HI")
        name = self.constant_pool[name_index].value
        info = self.get(length)
        return Attribute(name, length, info)

    def read_method(self):
        access_flags, name_index, descriptor_index, attributes_count = self.get(">HHHH")
        method = Method(access_flags, name_index, descriptor_index, [self.read_attribute() for _ in range(attributes_count)])
        self.methods.append(method)
        self.print("new method:", method)

    def read_methods(self):
        self.read_method_count()
        for _ in range(self.method_count):
            self.read_method()

    def read_attribute_count(self):
        self.attribute_count , = self.get(">H")
        self.print("attribute count:", self.attribute_count)

    def read_attributes(self):
        self.read_attribute_count()
        for _ in range(self.attribute_count):
            new_attribute = self.read_attribute()
            self.attributes.append(new_attribute)
            self.print(new_attribute)

    def get_class(self):
        return Class(
            self.magic,
            self.minor_version,
            self.major_version,
            self.constant_pool,
            self.access_flags,
            self.this_class,
            self.super_class,
            self.fields,
            self.methods,
            self.attributes
        )

    def read(self):
        self.read_magic()
        self.read_minor_version()
        self.read_major_version()
        self.read_constant_pool()
        self.read_access_flags()
        self.read_this_class()
        self.read_super_class()
        self.read_interfaces()
        self.read_fields()
        self.read_methods()
        self.read_attributes()


class ClassWriter:
    def __init__(self, clazz: Class):
        self.buffer = io.BytesIO()
        self.magic = clazz.magic
        self.minor_version = clazz.minor_version
        self.major_version = clazz.major_version
        self.constant_pool_count = len(clazz.constant_pool)
        self.constant_pool = clazz.constant_pool
        self.access_flags = clazz.access_flags
        self.this_class = clazz.this_class
        self.super_class = clazz.super_class
        self.interface_count = 0
        self.field_count = len(clazz.fields)
        self.fields = clazz.fields
        self.method_count = len(clazz.methods)
        self.methods = clazz.methods
        self.attribute_count = len(clazz.attributes)
        self.attributes = clazz.attributes

        self.write()

    def put(self, second_arg, *args):
        if isinstance(second_arg, str):
            self.buffer.write(struct.pack(second_arg, *args))
        else:
            self.buffer.write(second_arg)

    def write_magic(self):
        self.put(self.magic)

    def write_minor_version(self):
        self.put(self.minor_version)

    def write_major_version(self):
        self.put(self.major_version)

    def write_constant_pool_count(self):
        self.put(">H", self.constant_pool_count)

    def write_constant(self, constant: Constant):
        if constant.type == ConstantType.STRING:
            self.put(">B", 1)
            self.put(">H", len(constant.value.value))
            self.put(constant.value.value.encode())
        elif constant.type == ConstantType.CLASS_REF:
            self.put(">B", 7)
            self.put(">H", constant.value.number)
        elif constant.type == ConstantType.NAME_AND_TYPE:
            self.put(">B", 12)
            self.put(">HH", constant.value.name_number, constant.value.typ_number)
        elif constant.type == ConstantType.METHOD_REF:
            self.put(">B", 10)
            self.put(">HH", constant.value.class_ref_number, constant.value.nat_desc_number)
        else:
            raise Exception(f"Unsupported constant type: {constant.type}")

    def write_constant_pool(self):
        self.write_constant_pool_count()
        for constant in self.constant_pool[1:]:
            self.write_constant(constant)

    def write_access_flags(self):
        self.put(">H", self.access_flags)

    def write_this_class(self):
        self.put(">H", self.this_class.number)

    def write_super_class(self):
        self.put(">H", self.super_class.number)

    def write_interfaces(self):
        self.put(">H", 0)

    def write_field_count(self):
        self.put(">H", self.field_count)

    def write_field(self, field: Field):
        self.put(">HHHH", field.access_flags, field.name, field.descriptor, len(field.attributes))

    def write_fields(self):
        self.write_field_count()
        for field in self.fields:
            self.write_field(field)

    def write_method_count(self):
        self.put(">H", self.method_count)

    def write_attribute(self, attribute: Attribute):
        self.put(">HI", attribute.name.number, attribute.length)
        self.put(attribute.info)

    def write_method(self, method: Method):
        self.put(">HHHH", method.access_flags, method.name, method.descriptor, len(method.attributes))
        for attribute in method.attributes:
            self.write_attribute(attribute)

    def write_methods(self):
        self.write_method_count()
        for method in self.methods:
            self.write_method(method)

    def write_attribute_count(self):
        self.put(">H", len(self.attributes))

    def write_attributes(self):
        self.write_attribute_count()
        for attribute in self.attributes:
            self.write_attribute(attribute)

    def write(self):
        self.write_magic()
        self.write_minor_version()
        self.write_major_version()
        self.write_constant_pool()
        self.write_access_flags()
        self.write_this_class()
        self.write_super_class()
        self.write_interfaces()
        self.write_fields()
        self.write_methods()
        self.write_attributes()

        return self.buffer.getvalue()

    def get_class(self):
        return self.buffer.getvalue()

# cb = ClassBuilder(class_content)
# cb.add_field("field")
# clazz = cb.get_class()
#
# cw = ClassWriter(clazz)
# cw.get_class()
