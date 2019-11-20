import subprocess
cmd = './gradlew run --quiet --args="-m=perm -r=37d87f84-63c0-4f11-9a2c-d13a6e95cd84.json --rid=37d87f84-63c0-4f11-9a2c-d13a6e95cd84 -s=895791590728003 --ps=897101897398142"'
p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
for line in p.stdout.readlines():
    print(line.decode('utf-8'))