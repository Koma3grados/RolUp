package com.rolup.backend.model.combat;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "effects")
public class Effect {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "effect_seq")
    @SequenceGenerator(name = "effect_seq", sequenceName = "effect_seq", allocationSize = 1)
    private Long id;

    private String name;

    @Column(length = 2048)
    private String description;

    @Column(length = 1024)
    private String summary;

    private String iconUrl;

    private Integer remainingTurns; // Turnos restantes

    private Integer totalDuration; // Turnos totales que dura el efecto
    private boolean totalDurationIsAssaults; // true = totalTurns representa asaltos totales,false = representa turnos totales

    private boolean endsAtTurnStart; // true = termina al inicio del turno, false = al final

}
