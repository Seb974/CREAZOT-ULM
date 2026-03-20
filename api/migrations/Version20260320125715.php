<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260320125715 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_client (user_id UUID NOT NULL, client_id INT NOT NULL, PRIMARY KEY(user_id, client_id))');
        $this->addSql('CREATE INDEX IDX_A2161F68A76ED395 ON user_client (user_id)');
        $this->addSql('CREATE INDEX IDX_A2161F6819EB6921 ON user_client (client_id)');
        $this->addSql('ALTER TABLE user_client ADD CONSTRAINT FK_A2161F68A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_client ADD CONSTRAINT FK_A2161F6819EB6921 FOREIGN KEY (client_id) REFERENCES client (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE aeronef ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE aeronef ADD CONSTRAINT FK_F6D1EF9919EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_F6D1EF9919EB6921 ON aeronef (client_id)');
        $this->addSql('ALTER TABLE cadeau ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE cadeau ADD CONSTRAINT FK_3D21346019EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_3D21346019EB6921 ON cadeau (client_id)');
        $this->addSql('ALTER TABLE circuit ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE circuit ADD CONSTRAINT FK_1325F3A619EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_1325F3A619EB6921 ON circuit (client_id)');
        $this->addSql('ALTER TABLE combinaison ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE combinaison ADD CONSTRAINT FK_6DCBB34B19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_6DCBB34B19EB6921 ON combinaison (client_id)');
        $this->addSql('ALTER TABLE contact ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE contact ADD CONSTRAINT FK_4C62E63819EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_4C62E63819EB6921 ON contact (client_id)');
        $this->addSql('DROP INDEX idx_disponibilite_pilote_debut_fin');
        $this->addSql('DROP INDEX idx_disponibilite_debut_fin');
        $this->addSql('ALTER TABLE entretien ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE entretien ADD CONSTRAINT FK_2B58D6DA19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_2B58D6DA19EB6921 ON entretien (client_id)');
        $this->addSql('ALTER TABLE expense ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE expense ADD CONSTRAINT FK_2D3A8DA619EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_2D3A8DA619EB6921 ON expense (client_id)');
        $this->addSql('ALTER TABLE landing ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE landing ADD CONSTRAINT FK_EF3ACE1519EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_EF3ACE1519EB6921 ON landing (client_id)');
        $this->addSql('ALTER TABLE media_object ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE media_object ADD CONSTRAINT FK_14D4313219EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_14D4313219EB6921 ON media_object (client_id)');
        $this->addSql('ALTER TABLE option ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE option ADD CONSTRAINT FK_5A8600B019EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_5A8600B019EB6921 ON option (client_id)');
        $this->addSql('ALTER TABLE origine ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE origine ADD CONSTRAINT FK_150BB66F19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_150BB66F19EB6921 ON origine (client_id)');
        $this->addSql('ALTER TABLE passager ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE passager ADD CONSTRAINT FK_BFF42EE919EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_BFF42EE919EB6921 ON passager (client_id)');
        $this->addSql('ALTER TABLE payment ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE payment ADD CONSTRAINT FK_6D28840D19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_6D28840D19EB6921 ON payment (client_id)');
        $this->addSql('ALTER TABLE payment_detail ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE payment_detail ADD CONSTRAINT FK_B3EE40519EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_B3EE40519EB6921 ON payment_detail (client_id)');
        $this->addSql('ALTER TABLE prestation ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE prestation ADD CONSTRAINT FK_51C88FAD19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_51C88FAD19EB6921 ON prestation (client_id)');
        $this->addSql('ALTER TABLE rappel ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE rappel ADD CONSTRAINT FK_303A29C919EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_303A29C919EB6921 ON rappel (client_id)');
        $this->addSql('DROP INDEX idx_reservation_avion_debut_fin');
        $this->addSql('DROP INDEX idx_reservation_pilote_debut_fin');
        $this->addSql('ALTER TABLE reservation ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C8495519EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_42C8495519EB6921 ON reservation (client_id)');
        $this->addSql('ALTER TABLE vol ADD client_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE vol ADD CONSTRAINT FK_95C97EB19EB6921 FOREIGN KEY (client_id) REFERENCES client (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_95C97EB19EB6921 ON vol (client_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE user_client DROP CONSTRAINT FK_A2161F68A76ED395');
        $this->addSql('ALTER TABLE user_client DROP CONSTRAINT FK_A2161F6819EB6921');
        $this->addSql('DROP TABLE user_client');
        $this->addSql('ALTER TABLE cadeau DROP CONSTRAINT FK_3D21346019EB6921');
        $this->addSql('DROP INDEX IDX_3D21346019EB6921');
        $this->addSql('ALTER TABLE cadeau DROP client_id');
        $this->addSql('ALTER TABLE combinaison DROP CONSTRAINT FK_6DCBB34B19EB6921');
        $this->addSql('DROP INDEX IDX_6DCBB34B19EB6921');
        $this->addSql('ALTER TABLE combinaison DROP client_id');
        $this->addSql('ALTER TABLE expense DROP CONSTRAINT FK_2D3A8DA619EB6921');
        $this->addSql('DROP INDEX IDX_2D3A8DA619EB6921');
        $this->addSql('ALTER TABLE expense DROP client_id');
        $this->addSql('ALTER TABLE option DROP CONSTRAINT FK_5A8600B019EB6921');
        $this->addSql('DROP INDEX IDX_5A8600B019EB6921');
        $this->addSql('ALTER TABLE option DROP client_id');
        $this->addSql('ALTER TABLE circuit DROP CONSTRAINT FK_1325F3A619EB6921');
        $this->addSql('DROP INDEX IDX_1325F3A619EB6921');
        $this->addSql('ALTER TABLE circuit DROP client_id');
        $this->addSql('ALTER TABLE media_object DROP CONSTRAINT FK_14D4313219EB6921');
        $this->addSql('DROP INDEX IDX_14D4313219EB6921');
        $this->addSql('ALTER TABLE media_object DROP client_id');
        $this->addSql('ALTER TABLE prestation DROP CONSTRAINT FK_51C88FAD19EB6921');
        $this->addSql('DROP INDEX IDX_51C88FAD19EB6921');
        $this->addSql('ALTER TABLE prestation DROP client_id');
        $this->addSql('CREATE INDEX idx_disponibilite_pilote_debut_fin ON disponibilite (pilote_id, debut, fin)');
        $this->addSql('CREATE INDEX idx_disponibilite_debut_fin ON disponibilite (debut, fin)');
        $this->addSql('ALTER TABLE aeronef DROP CONSTRAINT FK_F6D1EF9919EB6921');
        $this->addSql('DROP INDEX IDX_F6D1EF9919EB6921');
        $this->addSql('ALTER TABLE aeronef DROP client_id');
        $this->addSql('ALTER TABLE contact DROP CONSTRAINT FK_4C62E63819EB6921');
        $this->addSql('DROP INDEX IDX_4C62E63819EB6921');
        $this->addSql('ALTER TABLE contact DROP client_id');
        $this->addSql('ALTER TABLE origine DROP CONSTRAINT FK_150BB66F19EB6921');
        $this->addSql('DROP INDEX IDX_150BB66F19EB6921');
        $this->addSql('ALTER TABLE origine DROP client_id');
        $this->addSql('ALTER TABLE rappel DROP CONSTRAINT FK_303A29C919EB6921');
        $this->addSql('DROP INDEX IDX_303A29C919EB6921');
        $this->addSql('ALTER TABLE rappel DROP client_id');
        $this->addSql('ALTER TABLE passager DROP CONSTRAINT FK_BFF42EE919EB6921');
        $this->addSql('DROP INDEX IDX_BFF42EE919EB6921');
        $this->addSql('ALTER TABLE passager DROP client_id');
        $this->addSql('ALTER TABLE payment DROP CONSTRAINT FK_6D28840D19EB6921');
        $this->addSql('DROP INDEX IDX_6D28840D19EB6921');
        $this->addSql('ALTER TABLE payment DROP client_id');
        $this->addSql('ALTER TABLE entretien DROP CONSTRAINT FK_2B58D6DA19EB6921');
        $this->addSql('DROP INDEX IDX_2B58D6DA19EB6921');
        $this->addSql('ALTER TABLE entretien DROP client_id');
        $this->addSql('ALTER TABLE reservation DROP CONSTRAINT FK_42C8495519EB6921');
        $this->addSql('DROP INDEX IDX_42C8495519EB6921');
        $this->addSql('ALTER TABLE reservation DROP client_id');
        $this->addSql('CREATE INDEX idx_reservation_avion_debut_fin ON reservation (avion_id, debut, fin)');
        $this->addSql('CREATE INDEX idx_reservation_pilote_debut_fin ON reservation (pilote_id, debut, fin)');
        $this->addSql('ALTER TABLE payment_detail DROP CONSTRAINT FK_B3EE40519EB6921');
        $this->addSql('DROP INDEX IDX_B3EE40519EB6921');
        $this->addSql('ALTER TABLE payment_detail DROP client_id');
        $this->addSql('ALTER TABLE landing DROP CONSTRAINT FK_EF3ACE1519EB6921');
        $this->addSql('DROP INDEX IDX_EF3ACE1519EB6921');
        $this->addSql('ALTER TABLE landing DROP client_id');
        $this->addSql('ALTER TABLE vol DROP CONSTRAINT FK_95C97EB19EB6921');
        $this->addSql('DROP INDEX IDX_95C97EB19EB6921');
        $this->addSql('ALTER TABLE vol DROP client_id');
    }
}
