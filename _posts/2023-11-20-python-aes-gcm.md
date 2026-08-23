---
layout: post
title: "[Python] AES-GCM 암호화하기"
subtitle: "[Python] AES_GCM 암호화하기"
categories: programming
tags: python
comments: true
---

> python으로 AES_GCM 형식으로 암호화하는 방법에 대해 알아보자


### Prerequisite

```shell
pip install pycryptodome
```

요번 예제에서는 `pycryptodome` 라이브러리를 사용한다. (다른녀석들도 잇는거같음)

### 암복호화 방식

#### Encrypt

```python
from Cryptodome.Cipher import AES
from Cryptodome.Random import get_random_bytes

def encrypt_AES_GCM(plaintext, associated_data):
    key = get_random_bytes(32)
    iv = get_random_bytes(12)

    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)

    cipher.update(associated_data)   # Associated Data 추가
    #  공백도 상관없음. Replay 공격을 막기 위함. 보통 유저 아이디(id/uuid)처럼 unique한 값 사용.

    ciphertext, tag = cipher.encrypt_and_digest(plaintext)

    return (key, iv, ciphertext, tag)
```

#### Decrypt

```python
from Cryptodome.Cipher import AES

def decrypt_AES_GCM(key, iv, ciphertext, associated_data, tag):
    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)

    cipher.update(associated_data)

    try:
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        plaintext =
        return plaintext
    except ValueError:
        print("Verification failed")
```

#### **AES-GCM 사용시 주의해야 할 점**

<span underline="true">IV는 안전한 난수 생성기인 Cryptographically Secure Pseudorandom Number Generator (CSPRNG)를 이용해 반드시 중복되지 않은 값을 사용</span>

> **AES-GCM 사용시 주의해야 할 점<br>· **256비트(32글자)의 키 사용 (AES256-GCM)**<br>· **<span underline="true">**IV 재사용 금지**</span>**: **AES-GCM의 IV는 Nonce로서 반드시 중복되지 않은 랜덤한 값이어야 한다. IV를 생성할 때에는 CSPRNG를 이용해 생성해야 한다.**<br>· **암호화 데이터 크기: 하나의 IV 당 64GB 이상의 데이터를 암호화하지 말아야 한다.**<br>· **하나의 암호화 키당 $`2^{31}`$(≈ 21억)번 이상 데이터를 암호화하는 데에 재사용하지 말아야 한다.**<br>· **AES-GCM으로 데이터 복호화 시 TAG 값을 통한 암호문 검증이 실패하는 경우가 존재하는지 로깅해야 한다.


### salt 사용하기

파일하나에 `salt (32) + the nonce (16) + the data (?) + the tag (16)` encrypt하면서 이렇게 우겨넣고..
요걸 쪼개서 가져와서 decrypt함.
> [https://nitratine.net/blog/post/python-gcm-encryption-tutorial/](https://nitratine.net/blog/post/python-gcm-encryption-tutorial/)

#### Encrypt

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/python-aes-gcm/01.png?raw=true)

```python
from Crypto.Random import get_random_bytes
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import scrypt

BUFFER_SIZE = 1024 * 1024  # The size in bytes that we read, encrypt and write to at once


password = "REDACTED"  # Get this from somewhere else like input()

input_filename = 'input.txt'  # Any file extension will work
output_filename = input_filename + '.encrypted'  # You can name this anything, I'm just putting .encrypted on the end

# Open files
file_in = open(input_filename, 'rb')  # rb = read bytes. Required to read non-text files
file_out = open(output_filename, 'wb')  # wb = write bytes. Required to write the encrypted data

salt = get_random_bytes(32)  # Generate salt
key = scrypt(password, salt, key_len=32, N=2**17, r=8, p=1)  # Generate a key using the password and salt
file_out.write(salt)  # Write the salt to the top of the output file

cipher = AES.new(key, AES.MODE_GCM)  # Create a cipher object to encrypt data
file_out.write(cipher.nonce)  # Write out the nonce to the output file under the salt

# Read, encrypt and write the data
data = file_in.read(BUFFER_SIZE)  # Read in some of the file
while len(data) != 0:  # Check if we need to encrypt anymore data
    encrypted_data = cipher.encrypt(data)  # Encrypt the data we read
    file_out.write(encrypted_data)  # Write the encrypted data to the output file
    data = file_in.read(BUFFER_SIZE)  # Read some more of the file to see if there is any more left

# Get and write the tag for decryption verification
tag = cipher.digest()  # Signal to the cipher that we are done and get the tag
file_out.write(tag)

# Close both files
file_in.close()
file_out.close()
```

#### Decrypt

![image](https://github.com/berrrrr/berrrrr.github.io/blob/master/_images/notion/python-aes-gcm/02.png?raw=true)

```python
import os

from Crypto.Cipher import AES
from Crypto.Protocol.KDF import scrypt

BUFFER_SIZE = 1024 * 1024  # The size in bytes that we read, encrypt and write to at once


password = "REDACTED"  # Get this from somewhere else like input()

input_filename = 'input.txt.encrypted'  # The encrypted file
output_filename = 'decrypted.txt'  # The decrypted file

# Open files
file_in = open(input_filename, 'rb')
file_out = open(output_filename, 'wb')

# Read salt and generate key
salt = file_in.read(32)  # The salt we generated was 32 bits long
key = scrypt(password, salt, key_len=32, N=2**17, r=8, p=1)  # Generate a key using the password and salt again

# Read nonce and create cipher
nonce = file_in.read(16)  # The nonce is 16 bytes long
cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)

# Identify how many bytes of encrypted there is
# We know that the salt (32) + the nonce (16) + the data (?) + the tag (16) is in the file
# So some basic algebra can tell us how much data we need to read to decrypt
file_in_size = os.path.getsize(input_filename)
encrypted_data_size = file_in_size - 32 - 16 - 16  # Total - salt - nonce - tag = encrypted data

# Read, decrypt and write the data
for _ in range(int(encrypted_data_size / BUFFER_SIZE)):  # Identify how many loops of full buffer reads we need to do
    data = file_in.read(BUFFER_SIZE)  # Read in some data from the encrypted file
    decrypted_data = cipher.decrypt(data)  # Decrypt the data
    file_out.write(decrypted_data)  # Write the decrypted data to the output file
data = file_in.read(int(encrypted_data_size % BUFFER_SIZE))  # Read whatever we have calculated to be left of encrypted data
decrypted_data = cipher.decrypt(data)  # Decrypt the data
file_out.write(decrypted_data)  # Write the decrypted data to the output file

# Verify encrypted file was not tampered with
tag = file_in.read(16)
try:
    cipher.verify(tag)
except ValueError as e:
    # If we get a ValueError, there was an error when decrypting so delete the file we created
    file_in.close()
    file_out.close()
    os.remove(output_filename)
    raise e

# If everything was ok, close the files
file_in.close()
file_out.close()
```

### 저장해야하는부분

key → 고정1개
salt → 값마다 따로 생성.
nonce(iv) → 값마다 따로 생성..
tag → 암호화의 부산물.. 위조가 안됐는지 verify 하기위함. 따로 저장해야댐

즉 뭉쳐서 저장하던 안하던
key는 시크릿으로 따로 저장하고, salt, iv → 난수로 생성해서 저장해두고 tag→ encrypt부산물로 따로저장해두고 사용한다고 생각하면될듯?
