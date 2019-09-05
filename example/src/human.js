
export default class Human {

    name = '';
    age = '';
    sex = '';

    constructor(name,age,sex) {
        this.name = name;
        this.age = age;
        this.sex = sex;
    }

    say(){
        console.log(`Human say: ${this.name} ${this.age} ${this.sex}`);
    }
}
