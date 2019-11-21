import requests
from hashlib import md5
from json import dumps, loads

from flask import Flask, request, render_template

from service.db import DB

ALGOS = ['stop', 'lwe']

app = Flask(__name__)
db = DB()


def get_pub_key_by_login(algo, login):
    r = requests.get('http://{}:11111/get_pub_key'.format(algo), params={'login': login})
    return r.json()

def get_note_sign(algo, login, note_hash):
    data = {
        'm': note_hash,
        'login': login
    }
    r = requests.post('http://{}:11111/sign'.format(algo), data=data)
    return r.json()

def get_note_verify(algo, login, note_hash, signature):
    data = {
        'm': note_hash,
        's': signature,
        'login': login
    }
    r = requests.post('http://{}:11111/verify'.format(algo), data=data)
    return r.json()

@app.route('/get_pub_key')
def get_pub_key():
    login = request.args.get('login')
    algo = request.args.get('algo')
    if not db.check_login(login):
        db.save_login(login)
    return get_pub_key_by_login(algo, login)

@app.route('/sign', methods=['POST'])
def sign():
    login = request.form['login']
    algo = request.form['algo']
    note = {
        'data': request.form['data']
    }
    note_hash = md5(dumps(note).encode()).hexdigest()

    signature = get_note_sign(algo, login, note_hash)
    signature['h'] = note_hash
    db.save_note(login, algo, note_hash, note)
    return signature

@app.route('/verify', methods=['POST'])
def verify():
    login = request.form['login']
    algo = request.form['algo']
    signature = request.form['s']
    note_hash = request.form['h']

    if not db.check_login(login):
        return {'error': 'No user'}, 403

    result = get_note_verify(algo, login, note_hash, signature)
    if result and result['res']:
        body = db.get_note(algo, note_hash)
        print(body)
        return body

@app.route('/get_users')
def get_users():
    users = db.get_logins()
    return {'users': list(users)}

@app.route('/get_notes')
def get_notes():
    login = request.args.get('login')
    algo = request.args.get('algo')
    notes = db.get_notes(login, algo)
    return {'notes': list(notes)}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sign_note')
def sign_note():
    return render_template('sign_note.html')

@app.route('/verify_note')
def verify_note():
    return render_template('verify_note.html')

@app.route('/notes')
def notes():
    return render_template('notes.html')

@app.route('/users')
def users():
    return render_template('users.html')
