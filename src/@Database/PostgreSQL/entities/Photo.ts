import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Customer } from "./Customer";

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @ManyToOne(() => Customer, (customer) => customer.photos)
    customer: Customer;
}
