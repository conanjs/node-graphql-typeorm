import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Photo } from "./Photo";

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Photo, (photo) => photo.customer)
    photos: Photo[];
}
