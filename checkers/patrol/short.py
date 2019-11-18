import subprocess
cmd = './gradlew run --quiet --args="-m=create -r=3ba77958-12f8-4567-8662-f8e46ffed570.json --id=fb31e70d-5151-4b57-9515-b5b60f67fb83 --rid=3ba77958-12f8-4567-8662-f8e46ffed570 -f=flag=="'
p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
for line in p.stdout.readlines():
    print(line.decode('utf-8'))